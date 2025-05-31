import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
import warnings
warnings.filterwarnings('ignore')

class MLModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = None
        self.pca = PCA(n_components=2)
        self.regression_model = None
        self.classification_model = None
        self.model_type = None

    def find_optimal_clusters(self, data, max_k=8):
        """Automatically find best number of clusters using silhouette score"""
        if len(data) < 4:  # Need at least 4 samples for clustering
            return 2
            
        max_k = min(max_k, len(data) - 1)
        scores = {}
        
        for k in range(2, max_k + 1):
            try:
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                labels = kmeans.fit_predict(data)
                if len(set(labels)) > 1:  # Ensure we have multiple clusters
                    score = silhouette_score(data, labels)
                    scores[k] = score
            except:
                continue
                
        if not scores:
            return 2
            
        best_k = max(scores, key=scores.get)
        return best_k

    def preprocess(self, df):
        """Preprocess the dataframe for ML operations"""
        df_processed = df.copy()

        # Handle missing values
        numeric_cols = df_processed.select_dtypes(include=['number']).columns
        categorical_cols = df_processed.select_dtypes(include=['object', 'category']).columns

        for col in numeric_cols:
            if df_processed[col].isnull().sum() > 0:
                df_processed[col] = df_processed[col].fillna(df_processed[col].median())

        for col in categorical_cols:
            if df_processed[col].isnull().sum() > 0:
                df_processed[col] = df_processed[col].fillna(df_processed[col].mode()[0] if len(df_processed[col].mode()) > 0 else 'Unknown')

        return df_processed, numeric_cols, categorical_cols

    def perform_clustering(self, df_processed, numeric_cols):
        """Perform clustering analysis"""
        if len(numeric_cols) == 0:
            return df_processed, {}

        # Scale numeric data for clustering
        X_scaled = self.scaler.fit_transform(df_processed[numeric_cols])
        
        # Find optimal clusters
        best_k = self.find_optimal_clusters(X_scaled)
        self.kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
        
        # Fit and predict clusters
        cluster_labels = self.kmeans.fit_predict(X_scaled)
        df_processed['cluster'] = cluster_labels
        
        # Create cluster profiles
        cluster_profiles = {}
        cluster_centers = self.kmeans.cluster_centers_
        
        for i in range(best_k):
            cluster_mask = df_processed['cluster'] == i
            cluster_size = cluster_mask.sum()
            
            # Get cluster characteristics
            profile = {}
            for j, col in enumerate(numeric_cols):
                profile[col] = {
                    'mean': float(df_processed[cluster_mask][col].mean()),
                    'center_value': float(cluster_centers[i][j])
                }
            
            cluster_profiles[f"Cluster_{i}"] = {
                'size': int(cluster_size),
                'percentage': float(cluster_size / len(df_processed) * 100),
                'profile': profile
            }
        
        return df_processed, cluster_profiles

    def perform_pca(self, df_processed, numeric_cols):
        """Perform PCA analysis"""
        if len(numeric_cols) < 2:
            return df_processed, {}
            
        X_scaled = self.scaler.fit_transform(df_processed[numeric_cols])
        
        # Fit PCA
        pca_result = self.pca.fit_transform(X_scaled)
        df_processed['pca_1'] = pca_result[:, 0]
        df_processed['pca_2'] = pca_result[:, 1]
        
        pca_data = {
            'explained_variance': self.pca.explained_variance_ratio_.tolist(),
            'cumulative_variance': np.cumsum(self.pca.explained_variance_ratio_).tolist()
        }
        
        return df_processed, pca_data

    def perform_regression_analysis(self, df_processed, numeric_cols):
        """Perform regression analysis if possible"""
        if len(numeric_cols) < 2:
            return {}
            
        # Try to find a good target variable (last numeric column or one with most variation)
        target_col = numeric_cols[-1]
        feature_cols = [col for col in numeric_cols if col != target_col]
        
        if len(feature_cols) == 0:
            return {}
            
        try:
            X = df_processed[feature_cols].fillna(0)
            y = df_processed[target_col].fillna(0)
            
            # Use Random Forest for better predictions
            self.regression_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.regression_model.fit(X, y)
            
            # Get feature importance
            feature_importance = dict(zip(feature_cols, self.regression_model.feature_importances_))
            
            # Make predictions
            y_pred = self.regression_model.predict(X)
            
            # Calculate metrics
            mse = np.mean((y - y_pred) ** 2)
            r2_score = self.regression_model.score(X, y)
            
            return {
                'target_variable': target_col,
                'feature_importance': feature_importance,
                'model_score': float(r2_score),
                'mse': float(mse),
                'predictions_sample': y_pred[:min(100, len(y_pred))].tolist(),
                'actual_sample': y[:min(100, len(y))].tolist()
            }
            
        except Exception as e:
            print(f"Regression analysis failed: {e}")
            return {}

    def generate_insights(self, df_processed, numeric_cols, categorical_cols):
        """Generate advanced insights from the data"""
        insights = {}
        
        # Correlation analysis
        if len(numeric_cols) > 1:
            corr_matrix = df_processed[numeric_cols].corr()
            
            # Find strongest correlations
            correlations = []
            for i in range(len(numeric_cols)):
                for j in range(i+1, len(numeric_cols)):
                    corr_val = corr_matrix.iloc[i, j]
                    if abs(corr_val) > 0.5:  # Only strong correlations
                        correlations.append({
                            'var1': numeric_cols[i],
                            'var2': numeric_cols[j],
                            'correlation': float(corr_val)
                        })
            
            insights['strong_correlations'] = correlations
            insights['correlation_matrix'] = corr_matrix.to_dict()
        
        # Outlier detection
        outliers = {}
        for col in numeric_cols:
            Q1 = df_processed[col].quantile(0.25)
            Q3 = df_processed[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_count = ((df_processed[col] < lower_bound) | (df_processed[col] > upper_bound)).sum()
            outliers[col] = {
                'count': int(outlier_count),
                'percentage': float(outlier_count / len(df_processed) * 100)
            }
        
        insights['outliers'] = outliers
        
        # Data distribution insights
        distribution_insights = {}
        for col in numeric_cols:
            distribution_insights[col] = {
                'mean': float(df_processed[col].mean()),
                'median': float(df_processed[col].median()),
                'std': float(df_processed[col].std()),
                'skewness': float(df_processed[col].skew()),
                'min': float(df_processed[col].min()),
                'max': float(df_processed[col].max())
            }
        
        insights['distributions'] = distribution_insights
        
        return insights

    def predict(self, df):
        """Main prediction method that orchestrates all ML operations"""
        # Preprocess data
        df_processed, numeric_cols, categorical_cols = self.preprocess(df)
        
        # Initialize results
        results = {
            'processed_data': df_processed,
            'cluster_profiles': {},
            'pca_analysis': {},
            'regression_analysis': {},
            'advanced_insights': {}
        }
        
        # Perform clustering
        if len(numeric_cols) > 0:
            df_processed, cluster_profiles = self.perform_clustering(df_processed, numeric_cols)
            results['cluster_profiles'] = cluster_profiles
            results['processed_data'] = df_processed
        
        # Perform PCA
        if len(numeric_cols) > 1:
            df_processed, pca_analysis = self.perform_pca(df_processed, numeric_cols)
            results['pca_analysis'] = pca_analysis
            results['processed_data'] = df_processed
        
        # Perform regression analysis
        regression_results = self.perform_regression_analysis(df_processed, numeric_cols)
        results['regression_analysis'] = regression_results
        
        # Generate advanced insights
        advanced_insights = self.generate_insights(df_processed, numeric_cols, categorical_cols)
        results['advanced_insights'] = advanced_insights
        
        return results