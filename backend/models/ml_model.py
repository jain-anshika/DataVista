import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

class MLModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=3, random_state=42)
        self.pca = PCA(n_components=2)

    def preprocess(self, df):
        """Preprocess data: handle missing values, scale numerical columns"""
        df_processed = df.copy()
        
        # Handle missing values
        numeric_cols = df_processed.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            df_processed[col] = df_processed[col].fillna(df_processed[col].mean())
        
        categorical_cols = df_processed.select_dtypes(include=['object', 'category']).columns
        for col in categorical_cols:
            df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0])
        
        # Scale numerical columns
        if len(numeric_cols) > 0:
            df_processed[numeric_cols] = self.scaler.fit_transform(df_processed[numeric_cols])
        
        return df_processed

    def predict(self, df):
        """Generate predictions and insights using clustering and dimensionality reduction"""
        df_with_predictions = df.copy()
        
        # Only proceed if we have numerical columns
        numeric_cols = df_with_predictions.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            # Apply clustering
            df_with_predictions['cluster'] = self.kmeans.fit_predict(df_with_predictions[numeric_cols])
            
            # Map clusters to meaningful labels
            cluster_centers = self.kmeans.cluster_centers_
            cluster_sizes = np.bincount(df_with_predictions['cluster'])
            
            # Determine cluster characteristics
            cluster_labels = []
            for i in range(len(cluster_centers)):
                if cluster_sizes[i] == max(cluster_sizes):
                    cluster_labels.append("Majority")
                elif cluster_sizes[i] == min(cluster_sizes):
                    cluster_labels.append("Minority")
                else:
                    cluster_labels.append("Average")
            
            # Map cluster numbers to labels
            df_with_predictions['segment'] = df_with_predictions['cluster'].map(
                {i: label for i, label in enumerate(cluster_labels)}
            )
            
            # Apply PCA for dimensionality reduction visualization
            if len(numeric_cols) > 1:
                pca_result = self.pca.fit_transform(df_with_predictions[numeric_cols])
                df_with_predictions['pca_1'] = pca_result[:, 0]
                df_with_predictions['pca_2'] = pca_result[:, 1]
                
                # Calculate explained variance
                explained_variance = self.pca.explained_variance_ratio_
                df_with_predictions.attrs['pca_explained_variance'] = explained_variance.tolist()
        
        return df_with_predictions
