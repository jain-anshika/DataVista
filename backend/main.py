from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import uvicorn
import json
from models.ml_model import MLModel
from utils.data_processing import process_data

app = FastAPI()

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = MLModel()  # Load ML Model

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    file_extension = file.filename.split(".")[-1]

    try:
        if file_extension == "csv":
            df = pd.read_csv(io.BytesIO(contents))
        elif file_extension in ["xls", "xlsx"]:
            df = pd.read_excel(io.BytesIO(contents))
        elif file_extension == "json":
            df = pd.read_json(io.BytesIO(contents))
        else:
            return {"error": "Unsupported file format"}

        # Process data
        insights, plots = process_data(df)

        # Apply ML model
        df_processed = model.preprocess(df)
        df_with_predictions = model.predict(df_processed)
        
        # Extract predictions and additional insights
        predictions = {}
        if 'segment' in df_with_predictions.columns:
            segment_counts = df_with_predictions['segment'].value_counts().to_dict()
            predictions['segment_distribution'] = segment_counts
        
        if 'pca_1' in df_with_predictions.columns and 'pca_2' in df_with_predictions.columns:
            # Sample a subset of rows for PCA visualization to avoid large response
            sample_size = min(1000, len(df_with_predictions))
            pca_sample = df_with_predictions.sample(n=sample_size, random_state=42)
            predictions['pca_data'] = {
                'x': pca_sample['pca_1'].tolist(),
                'y': pca_sample['pca_2'].tolist(),
                'segment': pca_sample['segment'].tolist() if 'segment' in pca_sample.columns else None,
                'explained_variance': df_with_predictions.attrs.get('pca_explained_variance', [])
            }
        
        # Convert DataFrame to JSON-serializable format
        # Sample a subset of rows to avoid large response
        sample_size = min(100, len(df_with_predictions))
        df_sample = df_with_predictions.sample(n=sample_size, random_state=42)
        
        # Convert to dict and handle non-serializable types
        df_dict = df_sample.to_dict(orient='records')
        
        return {
            "message": "File processed successfully",
            "insights": insights,
            "visualizations": plots,
            "predictions": predictions,
            "sample_data": df_dict
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
