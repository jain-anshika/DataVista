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
    config = {
        "model_type": "Advanced ML Pipeline",
        "pca_components": 2,
        "clustering_algorithm": "KMeans",
        "features": ["clustering", "pca", "regression", "insights"]
    }
    
    if hasattr(model, 'kmeans') and model.kmeans is not None:
        config["n_clusters"] = model.kmeans.n_clusters
    
    return config

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_extension = file.filename.split(".")[-1].lower()

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

        # Process data using existing function
        insights, plots = process_data(df)

        # Apply ML pipeline - this is the corrected part
        ml_results = model.predict(df)
        df_with_predictions = ml_results['processed_data']

        # Prepare predictions for frontend
        predictions = {}
        
        # Clustering results
        if ml_results['cluster_profiles']:
            cluster_profiles = ml_results['cluster_profiles']
            segment_distribution = {
                cluster_name: profile['size'] 
                for cluster_name, profile in cluster_profiles.items()
            }
            predictions['segment_distribution'] = segment_distribution
            predictions['cluster_profiles'] = cluster_profiles

        # PCA results
        if ml_results['pca_analysis'] and 'pca_1' in df_with_predictions.columns:
            sample_size = min(1000, len(df_with_predictions))
            pca_sample = df_with_predictions.sample(n=sample_size, random_state=42)
            
            predictions['pca_data'] = {
                'x': pca_sample['pca_1'].tolist(),
                'y': pca_sample['pca_2'].tolist(),
                'segment': [f"Cluster_{int(c)}" for c in pca_sample.get('cluster', [0] * len(pca_sample))],
                'explained_variance': ml_results['pca_analysis'].get('explained_variance', [])
            }

        # Regression results
        if ml_results['regression_analysis']:
            predictions['regression_analysis'] = ml_results['regression_analysis']

        # Advanced insights
        if ml_results['advanced_insights']:
            predictions['advanced_insights'] = ml_results['advanced_insights']

        # Feature importance (if available)
        if 'regression_analysis' in ml_results and ml_results['regression_analysis'].get('feature_importance'):
            predictions['feature_importance'] = ml_results['regression_analysis']['feature_importance']

        # Correlation insights
        if 'advanced_insights' in ml_results and 'strong_correlations' in ml_results['advanced_insights']:
            predictions['correlations'] = ml_results['advanced_insights']['strong_correlations']

        # Sample Data with predictions
        sample_size = min(100, len(df_with_predictions))
        df_sample = df_with_predictions.sample(n=sample_size, random_state=42)
        sample_data = df_sample.to_dict(orient='records')

        return {
            "message": "File processed successfully",
            "insights": insights,
            "visualizations": plots,
            "predictions": predictions,
            "sample_data": sample_data,
            "model_info": {
                "features_used": len(df.select_dtypes(include=['number']).columns),
                "samples_processed": len(df),
                "algorithms_applied": ["KMeans Clustering", "PCA", "Random Forest Regression"]
            }
        }

    except Exception as e:
        logging.error(f"Processing failed: {e}")
        return {"error": str(e), "details": "Check if the file format is correct and contains numeric data"}

@app.get("/model-status")
def get_model_status():
    """Get current model status and capabilities"""
    status = {
        "model_ready": True,
        "algorithms": {
            "clustering": "KMeans with automatic K selection",
            "dimensionality_reduction": "PCA (2 components)",
            "regression": "Random Forest Regressor",
            "analysis": "Statistical insights and correlation analysis"
        }
    }
    
    if hasattr(model, 'kmeans') and model.kmeans is not None:
        status["last_clustering"] = {
            "n_clusters": model.kmeans.n_clusters,
            "cluster_centers_shape": model.kmeans.cluster_centers_.shape
        }
    
    return status

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)  # Changed to port 5000 to match your frontend