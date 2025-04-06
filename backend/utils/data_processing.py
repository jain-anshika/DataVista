import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO
import numpy as np

def generate_visualizations(df):
    plots = {}

    # Histogram of numerical columns
    for col in df.select_dtypes(include=['number']).columns:
        plt.figure(figsize=(10, 6))
        sns.histplot(df[col], kde=True)
        plt.title(f'Distribution of {col}')
        plt.xlabel(col)
        plt.ylabel('Frequency')
        buf = BytesIO()
        plt.savefig(buf, format="png", dpi=100, bbox_inches='tight')
        buf.seek(0)
        plots[f"histogram_{col}"] = base64.b64encode(buf.getvalue()).decode("utf-8")
        plt.close()

    # Correlation heatmap for numerical columns
    numeric_df = df.select_dtypes(include=['number'])
    if len(numeric_df.columns) > 1:
        plt.figure(figsize=(12, 10))
        correlation = numeric_df.corr()
        sns.heatmap(correlation, annot=True, cmap='coolwarm', fmt='.2f')
        plt.title('Correlation Heatmap')
        buf = BytesIO()
        plt.savefig(buf, format="png", dpi=100, bbox_inches='tight')
        buf.seek(0)
        plots["correlation_heatmap"] = base64.b64encode(buf.getvalue()).decode("utf-8")
        plt.close()

    # Box plots for numerical columns
    for col in df.select_dtypes(include=['number']).columns:
        plt.figure(figsize=(10, 6))
        sns.boxplot(y=df[col])
        plt.title(f'Box Plot of {col}')
        plt.ylabel(col)
        buf = BytesIO()
        plt.savefig(buf, format="png", dpi=100, bbox_inches='tight')
        buf.seek(0)
        plots[f"boxplot_{col}"] = base64.b64encode(buf.getvalue()).decode("utf-8")
        plt.close()

    # Bar charts for categorical columns
    for col in df.select_dtypes(include=['object', 'category']).columns:
        if df[col].nunique() <= 20:  # Only for columns with reasonable number of categories
            plt.figure(figsize=(12, 6))
            value_counts = df[col].value_counts().head(10)
            sns.barplot(x=value_counts.index, y=value_counts.values)
            plt.title(f'Top 10 Categories in {col}')
            plt.xlabel(col)
            plt.ylabel('Count')
            plt.xticks(rotation=45)
            buf = BytesIO()
            plt.savefig(buf, format="png", dpi=100, bbox_inches='tight')
            buf.seek(0)
            plots[f"barchart_{col}"] = base64.b64encode(buf.getvalue()).decode("utf-8")
            plt.close()

    return plots

def process_data(df):
    """Comprehensive Data Processing: Handle missing values and generate insights."""
    # Create a copy to avoid modifying the original dataframe
    df_processed = df.copy()
    
    # Basic insights
    insights = {
        "num_rows": df_processed.shape[0],
        "num_columns": df_processed.shape[1],
        "columns": list(df_processed.columns),
        "missing_values": df_processed.isnull().sum().to_dict(),
        "data_types": df_processed.dtypes.astype(str).to_dict(),
    }
    
    # Statistical summary for numerical columns
    numeric_cols = df_processed.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        stats = df_processed[numeric_cols].describe().to_dict()
        insights["statistics"] = stats
    
    # Value counts for categorical columns
    categorical_cols = df_processed.select_dtypes(include=['object', 'category']).columns
    if len(categorical_cols) > 0:
        value_counts = {}
        for col in categorical_cols:
            if df_processed[col].nunique() <= 20:  # Only for columns with reasonable number of categories
                value_counts[col] = df_processed[col].value_counts().head(10).to_dict()
        insights["categorical_summary"] = value_counts
    
    # Correlation for numerical columns
    if len(numeric_cols) > 1:
        correlation = df_processed[numeric_cols].corr().to_dict()
        insights["correlation"] = correlation
    
    # Generate visualizations
    plots = generate_visualizations(df_processed)
    
    return insights, plots
