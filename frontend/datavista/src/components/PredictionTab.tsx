"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { PCA } from 'ml-pca';
import kmeans from 'ml-kmeans'; 
import { mean, median, mode, variance } from 'simple-statistics';
import SimpleLinearRegression from 'ml-regression-simple-linear'; 

const COLORS = ['#9333EA', '#7C3AED', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

interface PredictionTabProps {
  data: Record<string, any>[];
  columns: string[];
  dataTypes: Record<string, string>;
  onLoading: (isLoading: boolean) => void;
}

interface ClusterResult {
  clusters: Record<string, number>;
  pcaData: {
    x: number[];
    y: number[];
    cluster: number[];
    explainedVariance: number[];
  };
}

interface RegressionResult {
  predictions: number[];
  actual: number[];
  rSquared: number;
  coefficients: Record<string, number>;
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

export default function PredictionTab({ data, columns, dataTypes, onLoading }: PredictionTabProps) {
  const [activePrediction, setActivePrediction] = useState<string>("clustering");
  const [clusterResult, setClusterResult] = useState<ClusterResult | null>(null);
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [features, setFeatures] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  // Prepare numerical columns for analysis
  const numericalColumns = columns.filter(col => 
    dataTypes[col] === 'number' || dataTypes[col] === 'integer'
  );

  useEffect(() => {
    if (data.length > 0 && numericalColumns.length > 0) {
      performClustering();
      calculateFeatureImportance();
    }
  }, [data]);

  const performClustering = async () => {
    onLoading(true);
    
    try {
      // Prepare data for PCA
      const numericData = data.map(row => 
        numericalColumns.map(col => parseFloat(row[col]) || 0 
),      );
      
      // Normalize data
      const normalizedData = normalizeData(numericData);
      
      // Perform PCA
      const pca = new PCA(normalizedData);
      const reducedData = pca.predict(normalizedData, { nComponents: 2 });
      const explainedVariance = pca.getExplainedVariance();
      
      // Perform clustering
      const kmeans = new KMeans(3, { initialization: 'kmeans++' });
      const clusters = kmeans.cluster(numericData);
      
      // Prepare results
      const result: ClusterResult = {
        clusters: clusters.clusters.reduce((acc, cluster, idx) => {
          acc[`Cluster ${cluster}`] = (acc[`Cluster ${cluster}`] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        pcaData: {
          x: reducedData.getColumn(0),
          y: reducedData.getColumn(1),
          cluster: clusters.clusters,
          explainedVariance: explainedVariance.slice(0, 2)
        }
      };
      
      setClusterResult(result);
    } catch (error) {
      console.error("Clustering error:", error);
    } finally {
      onLoading(false);
    }
  };

  const normalizeData = (data: number[][]) => {
    const normalized = [];
    const cols = data[0].length;
    
    for (let i = 0; i < cols; i++) {
      const column = data.map(row => row[i]);
      const min = Math.min(...column);
      const max = Math.max(...column);
      const range = max - min;
      
      normalized.push(column.map(val => range !== 0 ? (val - min) / range : 0));
    }
    
    // Transpose back to original structure
    return normalized[0].map((_, i) => normalized.map(row => row[i]));
  };

  const calculateFeatureImportance = () => {
    // Simple correlation-based feature importance
    const importance: FeatureImportance[] = [];
    
    if (numericalColumns.length < 2) return;
    
    for (let i = 0; i < numericalColumns.length; i++) {
      for (let j = i + 1; j < numericalColumns.length; j++) {
        const col1 = numericalColumns[i];
        const col2 = numericalColumns[j];
        
        const values1 = data.map(row => parseFloat(row[col1]) || 0);
        const values2 = data.map(row => parseFloat(row[col2]) || 0);
        
        const correlation = pearsonCorrelation(values1, values2);
        importance.push({ feature: `${col1} vs ${col2}`, importance: Math.abs(correlation) });
      }
    }
    
    // Sort by importance
    importance.sort((a, b) => b.importance - a.importance);
    setFeatureImportance(importance.slice(0, 10));
  };

  const pearsonCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }
    
    const numerator = sumXY - (sumX * sumY / n);
    const denominator = Math.sqrt((sumX2 - (sumX * sumX / n)) * (sumY2 - (sumY * sumY / n)));
    
    return denominator !== 0 ? numerator / denominator : 0;
  };

  const trainRegressionModel = async () => {
    if (!targetColumn || features.length === 0) return;
    
    onLoading(true);
    setIsTraining(true);
    
    try {
      // Prepare data
      const xValues = data.map(row => 
        features.map(feature => parseFloat(row[feature]) || 0
      ),      );
      const yValues = data.map(row => parseFloat(row[targetColumn]) || 0);
      
      // Train linear regression model
      const regression = new LinearRegression(xValues, yValues);
      
      // Make predictions
      const predictions = xValues.map(x => regression.predict(x));
      
      // Calculate R-squared
      const yMean = mean(yValues);
      const ssTotal = yValues.reduce((acc, val) => acc + Math.pow(val - yMean, 2), 0);
      const ssResidual = yValues.reduce((acc, val, idx) => acc + Math.pow(val - predictions[idx], 2), 0);
      const rSquared = 1 - (ssResidual / ssTotal);
      
      // Get coefficients
      const coefficients: Record<string, number> = {};
      features.forEach((feature, index) => {
        coefficients[feature] = regression.weights[index + 1]; // +1 because index 0 is the intercept
      });
      
      setRegressionResult({
        predictions,
        actual: yValues,
        rSquared,
        coefficients
      });
      
    } catch (error) {
      console.error("Training error:", error);
    } finally {
      onLoading(false);
      setIsTraining(false);
    }
  };

  const renderClusteringResults = () => {
    if (!clusterResult) return null;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="text-xl font-bold mb-4 text-purple-100">Cluster Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(clusterResult.clusters).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.entries(clusterResult.clusters).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#581C87',
                    border: '1px solid #7C3AED',
                    borderRadius: '8px',
                    color: '#E9D5FF'
                  }}
                />
                <Legend wrapperStyle={{ color: '#C4B5FD' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="text-xl font-bold mb-2 text-purple-100">PCA Visualization</h4>
          <p className="text-sm text-purple-300 mb-4">
            Explained variance: {clusterResult.pcaData.explainedVariance.map((v, i) => 
              `PC${i+1}: ${(v * 100).toFixed(1)}%`
            ).join(', ')}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C3AED40" />
                <XAxis 
                  dataKey="x" 
                  name="PC1" 
                  tick={{ fill: '#C4B5FD', fontSize: 12 }}
                />
                <YAxis 
                  dataKey="y" 
                  name="PC2" 
                  tick={{ fill: '#C4B5FD', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#581C87',
                    border: '1px solid #7C3AED',
                    borderRadius: '8px',
                    color: '#E9D5FF'
                  }}
                />
                <Legend wrapperStyle={{ color: '#C4B5FD' }} />
                <Scatter 
                  name="Data Points" 
                  data={clusterResult.pcaData.x.map((x, i) => ({
                    x,
                    y: clusterResult.pcaData.y[i],
                    cluster: clusterResult.pcaData.cluster[i]
                  }))}
                  fill="#A855F7"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderRegressionResults = () => {
    if (!regressionResult) return null;
    
    const chartData = regressionResult.actual.map((actual, idx) => ({
      actual,
      predicted: regressionResult.predictions[idx],
      index: idx
    }));
    
    // Prepare coefficients data for display
    const coefficientsData = Object.entries(regressionResult.coefficients).map(([feature, value]) => ({
      feature,
      value
    }));
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4 text-purple-100">Actual vs Predicted</h4>
            <p className="text-sm text-purple-300 mb-2">
              R-squared: {regressionResult.rSquared.toFixed(3)}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7C3AED40" />
                  <XAxis 
                    dataKey="index" 
                    name="Index" 
                    tick={{ fill: '#C4B5FD', fontSize: 12 }}
                  />
                  <YAxis 
                    name="Value" 
                    tick={{ fill: '#C4B5FD', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#581C87',
                      border: '1px solid #7C3AED',
                      borderRadius: '8px',
                      color: '#E9D5FF'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#C4B5FD' }} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual" 
                    stroke="#A855F7" 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    name="Predicted" 
                    stroke="#10B981" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4 text-purple-100">Feature Importance</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7C3AED40" />
                  <XAxis 
                    dataKey="feature" 
                    tick={{ fill: '#C4B5FD', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#C4B5FD', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#581C87',
                      border: '1px solid #7C3AED',
                      borderRadius: '8px',
                      color: '#E9D5FF'
                    }}
                  />
                  <Bar 
                    dataKey="importance" 
                    name="Importance" 
                    fill="#6366F1"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="text-xl font-bold mb-4 text-purple-100">Regression Coefficients</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-500/30">
              <thead className="bg-purple-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Coefficient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Importance</th>
                </tr>
              </thead>
              <tbody className="bg-purple-900/10 divide-y divide-purple-500/30">
                {coefficientsData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">{row.feature}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">{row.value.toFixed(4)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-100">
                      <div className="w-full bg-purple-900/50 rounded-full h-2.5">
                        <div 
                          className="bg-purple-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.abs(row.value) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderRegressionSetup = () => {
    return (
      <motion.div 
        className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4 className="text-xl font-bold mb-4 text-purple-100">Regression Setup</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Target Column
            </label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full bg-purple-900/50 border border-purple-500/50 text-purple-100 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select target column</option>
              {numericalColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {numericalColumns.filter(col => col !== targetColumn).map(col => (
                <motion.div 
                  key={col}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`feature-${col}`}
                    checked={features.includes(col)}
                    onChange={() => {
                      if (features.includes(col)) {
                        setFeatures(features.filter(f => f !== col));
                      } else {
                        setFeatures([...features, col]);
                      }
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                  />
                  <label htmlFor={`feature-${col}`} className="ml-2 text-sm text-purple-200">
                    {col}
                  </label>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.button
            onClick={trainRegressionModel}
            disabled={!targetColumn || features.length === 0 || isTraining}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl w-full"
            whileHover={{ scale: (!targetColumn || features.length === 0 || isTraining) ? 1 : 1.05 }}
            whileTap={{ scale: (!targetColumn || features.length === 0 || isTraining) ? 1 : 0.95 }}
          >
            {isTraining ? (
              <div className="flex items-center justify-center">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Training Model...
              </div>
            ) : "Train Model"}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-purple-100 flex items-center">
        <span className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
        Advanced Analytics
      </h3>
      
      <div className="border-b border-purple-500/30 mb-6">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {[
            { id: "clustering", label: "Clustering", icon: "🔍" },
            { id: "regression", label: "Regression", icon: "📈" }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActivePrediction(tab.id)}
              className={`${
                activePrediction === tab.id
                  ? "border-purple-400 text-purple-100 bg-purple-800/30"
                  : "border-transparent text-purple-300 hover:text-purple-200 hover:border-purple-400/50 hover:bg-purple-800/20"
              } whitespace-nowrap py-3 px-5 border-b-2 font-semibold text-sm transition-all duration-300 rounded-t-lg flex items-center space-x-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
      
      {activePrediction === "clustering" && renderClusteringResults()}
      {activePrediction === "regression" && (
        <div className="space-y-6">
          {regressionResult ? renderRegressionResults() : renderRegressionSetup()}
        </div>
      )}
    </div>
  );
}