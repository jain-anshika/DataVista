from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import uvicorn
import logging
from models.ml_model import MLModel
from utils.data_processing import process_data

app = FastAPI()

# Logging setup
logging.basicConfig(level=logging.INFO)

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = MLModel()  # Initialize ML model

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/model-config")
def get_model_config():
    return {
        "n_clusters": model.kmeans.n_clusters,
        "model_type": "KMeans",
        "pca_components": model.pca.n_components
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_extension = file.filename.split(".")[-1]

        # Read file into DataFrame
        if file_extension == "csv":
            df = pd.read_csv(io.BytesIO(contents))
        elif file_extension in ["xls", "xlsx"]:
            df = pd.read_excel(io.BytesIO(contents))
        elif file_extension == "json":
            df = pd.read_json(io.BytesIO(contents))
        else:
            return {"error": "Unsupported file format"}

        logging.info(f"Received file: {file.filename} with shape {df.shape}")

        # Process data
        insights, plots = process_data(df)

        # Apply ML pipeline
        df_processed = model.preprocess(df)
        df_with_predictions, cluster_profiles = model.predict(df_processed)

        # Prediction insights
        predictions = {}
        if 'segment' in df_with_predictions.columns:
            segment_counts = df_with_predictions['segment'].value_counts().to_dict()
            predictions['segment_distribution'] = segment_counts
            predictions['cluster_profiles'] = cluster_profiles

        if 'pca_1' in df_with_predictions.columns and 'pca_2' in df_with_predictions.columns:
            sample_size = min(1000, len(df_with_predictions))
            pca_sample = df_with_predictions.sample(n=sample_size, random_state=42)
            predictions['pca_data'] = {
                'x': pca_sample['pca_1'].tolist(),
                'y': pca_sample['pca_2'].tolist(),
                'segment': pca_sample['segment'].tolist(),
                'explained_variance': df_with_predictions.attrs.get('pca_explained_variance', [])
            }

        # Sample Data
        df_sample = df_with_predictions.sample(n=min(100, len(df_with_predictions)), random_state=42)
        sample_data = df_sample.to_dict(orient='records')

        return {
            "message": "File processed successfully",
            "insights": insights,
            "visualizations": plots,
            "predictions": predictions,
            "sample_data": sample_data
        }

    except Exception as e:
        logging.error(f"Processing failed: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
