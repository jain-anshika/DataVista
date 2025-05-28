import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

class MLModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = None  # Will be set dynamically
        self.pca = PCA(n_components=2)

    def find_optimal_clusters(self, data, max_k=6):
        """Automatically find best number of clusters using silhouette score"""
        scores = {}
        for k in range(2, max_k + 1):
            kmeans = KMeans(n_clusters=k, random_state=42)
            labels = kmeans.fit_predict(data)
            score = silhouette_score(data, labels)
            scores[k] = score
        best_k = max(scores, key=scores.get)
        return best_k

    def preprocess(self, df):
        df_processed = df.copy()

        # Handle missing values
        numeric_cols = df_processed.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            df_processed[col] = df_processed[col].fillna(df_processed[col].mean())

        categorical_cols = df_processed.select_dtypes(include=['object', 'category']).columns
        for col in categorical_cols:
            df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0])

        # Scale numeric data
        if len(numeric_cols) > 0:
            df_processed[numeric_cols] = self.scaler.fit_transform(df_processed[numeric_cols])

        return df_processed

    def predict(self, df):
        df_pred = df.copy()
        numeric_cols = df_pred.select_dtypes(include=['number']).columns

        if len(numeric_cols) > 0:
            # Find best cluster count
            best_k = self.find_optimal_clusters(df_pred[numeric_cols])
            self.kmeans = KMeans(n_clusters=best_k, random_state=42)
            df_pred['cluster'] = self.kmeans.fit_predict(df_pred[numeric_cols])

            # Map cluster index to profile
            cluster_centers = self.kmeans.cluster_centers_
            cluster_sizes = np.bincount(df_pred['cluster'])

            cluster_profiles = {}
            cluster_labels = []

            for i, center in enumerate(cluster_centers):
                profile = {col: round(val, 2) for col, val in zip(numeric_cols, center)}
                cluster_profiles[f"Cluster {i}"] = {
                    "size": int(cluster_sizes[i]),
                    "profile": profile
                }

                if cluster_sizes[i] == max(cluster_sizes):
                    cluster_labels.append("Majority")
                elif cluster_sizes[i] == min(cluster_sizes):
                    cluster_labels.append("Minority")
                else:
                    cluster_labels.append("Average")

            df_pred['segment'] = df_pred['cluster'].map({i: label for i, label in enumerate(cluster_labels)})

            # Apply PCA
            if len(numeric_cols) > 1:
                pca_result = self.pca.fit_transform(df_pred[numeric_cols])
                df_pred['pca_1'] = pca_result[:, 0]
                df_pred['pca_2'] = pca_result[:, 1]
                df_pred.attrs['pca_explained_variance'] = self.pca.explained_variance_ratio_.tolist()

            return df_pred, cluster_profiles
        else:
            return df_pred, {}
