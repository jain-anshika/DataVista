"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell
} from 'recharts';

interface AnalysisResult {
  insights: {
    num_rows: number;
    num_columns: number;
    columns: string[];
    missing_values: Record<string, number>;
    data_types: Record<string, string>;
    statistics?: Record<string, Record<string, number>>;
    categorical_summary?: Record<string, Record<string, number>>;
    correlation?: Record<string, Record<string, number>>;
  };
  visualizations: Record<string, string>;
  predictions?: {
    segment_distribution?: Record<string, number>;
    pca_data?: {
      x: number[];
      y: number[];
      segment: string[] | null;
      explained_variance: number[];
    };
  };
  sample_data?: Record<string, unknown>[];
}

interface PieChartLabelProps {
  name: string;
  percent: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const analyzeData = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze data");
      }

      const data = await response.json();
      setAnalysisResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    if (!analysisResults) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Dataset Overview</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600">Rows:</span>
              <span className="font-medium">{analysisResults.insights.num_rows}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Columns:</span>
              <span className="font-medium">{analysisResults.insights.num_columns}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Column Information</h3>
          <div className="max-h-40 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(analysisResults.insights.data_types).map(([column, type]) => (
                  <tr key={column}>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{column}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{type}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                      {analysisResults.insights.missing_values[column] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!analysisResults || !analysisResults.insights.statistics) return null;
    
    const numericColumns = Object.keys(analysisResults.insights.statistics);
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Statistical Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">25%</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">50%</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">75%</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {numericColumns.map((column) => {
                const stats = analysisResults.insights.statistics?.[column];
                if (!stats) return null;
                
                return (
                  <tr key={column}>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{column}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats.count}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats.mean.toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats.std.toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats.min.toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats['25%'].toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats['50%'].toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats['75%'].toFixed(2)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{stats.max.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCategoricalSummary = () => {
    if (!analysisResults || !analysisResults.insights.categorical_summary) return null;
    
    const categoricalColumns = Object.keys(analysisResults.insights.categorical_summary);
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Categorical Summary</h3>
        {categoricalColumns.map((column) => {
          const categories = analysisResults.insights.categorical_summary?.[column];
          if (!categories) return null;
          
          const data = Object.entries(categories).map(([name, value]) => ({ name, value }));
          
          return (
            <div key={column} className="bg-white p-4 rounded-md shadow">
              <h4 className="text-md font-medium mb-2">{column}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVisualizations = () => {
    if (!analysisResults) return null;
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Visualizations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysisResults.visualizations).map(([name, data]) => (
            <div key={name} className="border rounded-md p-2">
              <h4 className="text-sm font-medium mb-2">{name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
              <img 
                src={`data:image/png;base64,${data}`} 
                alt={name} 
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPredictions = () => {
    if (!analysisResults || !analysisResults.predictions) return null;
    
  return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Predictions & Insights</h3>
        
        {analysisResults.predictions.segment_distribution && (
          <div className="bg-white p-4 rounded-md shadow">
            <h4 className="text-md font-medium mb-2">Data Segments</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analysisResults.predictions.segment_distribution).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(analysisResults.predictions.segment_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {analysisResults.predictions.pca_data && (
          <div className="bg-white p-4 rounded-md shadow">
            <h4 className="text-md font-medium mb-2">PCA Visualization</h4>
            <p className="text-sm text-gray-500 mb-2">
              Explained variance: {analysisResults.predictions.pca_data.explained_variance.map((v, i) => 
                `PC${i+1}: ${(v * 100).toFixed(1)}%`
              ).join(', ')}
            </p>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="PC1" />
                  <YAxis dataKey="y" name="PC2" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  {analysisResults.predictions.pca_data.segment ? (
                    <Scatter 
                      name="Data Points" 
                      data={analysisResults.predictions.pca_data.x.map((x, i) => {
                        const pcaData = analysisResults.predictions?.pca_data;
                        if (!pcaData) return { x, y: 0, segment: 'Unknown' };
                        
                        return {
                          x,
                          y: pcaData.y[i],
                          segment: pcaData.segment?.[i] || 'Unknown'
                        };
                      })}
                      fill="#8884d8"
                    />
                  ) : (
                    <Scatter 
                      name="Data Points" 
                      data={analysisResults.predictions.pca_data.x.map((x, i) => {
                        const pcaData = analysisResults.predictions?.pca_data;
                        if (!pcaData) return { x, y: 0 };
                        
                        return {
                          x,
                          y: pcaData.y[i]
                        };
                      })}
                      fill="#8884d8"
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDataSample = () => {
    if (!analysisResults || !analysisResults.sample_data || analysisResults.sample_data.length === 0) return null;
    
    const columns = Object.keys(analysisResults.sample_data[0]);
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Data Sample</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analysisResults.sample_data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                      {typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Analysis Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Data</h2>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (CSV, Excel, or JSON)
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>
            <button
              onClick={analyzeData}
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : "Analyze Data"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`${
                    activeTab === "statistics"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => setActiveTab("categorical")}
                  className={`${
                    activeTab === "categorical"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Categorical
                </button>
                <button
                  onClick={() => setActiveTab("visualizations")}
                  className={`${
                    activeTab === "visualizations"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Visualizations
                </button>
                <button
                  onClick={() => setActiveTab("predictions")}
                  className={`${
                    activeTab === "predictions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Predictions
                </button>
                <button
                  onClick={() => setActiveTab("sample")}
                  className={`${
                    activeTab === "sample"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Data Sample
                </button>
              </nav>
            </div>
            
            <div className="mt-4">
              {activeTab === "overview" && renderOverview()}
              {activeTab === "statistics" && renderStatistics()}
              {activeTab === "categorical" && renderCategoricalSummary()}
              {activeTab === "visualizations" && renderVisualizations()}
              {activeTab === "predictions" && renderPredictions()}
              {activeTab === "sample" && renderDataSample()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}