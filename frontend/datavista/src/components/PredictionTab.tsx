"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#9333EA', '#7C3AED', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

export default function PredictionTab() {
  const [activePrediction, setActivePrediction] = useState<string>("clustering");
  const [targetColumn, setTargetColumn] = useState<string>("price");
  const [features, setFeatures] = useState<string[]>(["rooms", "area"]);
  const [isTraining, setIsTraining] = useState(false);

  // Hardcoded cluster data
  const clusterResult = {
    clusters: {
      "Cluster 0": 45,
      "Cluster 1": 30,
      "Cluster 2": 25
    },
    pcaData: {
      x: Array(100).fill(0).map((_, i) => Math.random() * 10 - 5),
      y: Array(100).fill(0).map((_, i) => Math.random() * 10 - 5),
      cluster: Array(100).fill(0).map(() => Math.floor(Math.random() * 3)),
      explainedVariance: [0.65, 0.25]
    }
  };

  // Hardcoded regression data
  const regressionResult = {
    predictions: Array(20).fill(0).map((_, i) => 150 + i * 5 + (Math.random() * 20 - 10)),
    actual: Array(20).fill(0).map((_, i) => 150 + i * 5),
    rSquared: 0.872,
    coefficients: {
      rooms: 25.4,
      area: 0.78,
      age: -1.2,
      location: 15.6
    }
  };

  // Hardcoded feature importance
  const featureImportance = [
    { feature: "rooms vs price", importance: 0.85 },
    { feature: "area vs price", importance: 0.78 },
    { feature: "age vs price", importance: 0.45 },
    { feature: "location vs price", importance: 0.62 },
    { feature: "rooms vs area", importance: 0.55 }
  ];

  const numericalColumns = ["price", "rooms", "area", "age", "location"];

  const trainRegressionModel = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
    }, 1500);
  };

  const renderClusteringResults = () => {
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
    const chartData = regressionResult.actual.map((actual, idx) => ({
      actual,
      predicted: regressionResult.predictions[idx],
      index: idx
    }));
    
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
                          style={{ width: `${Math.abs(row.value) * 20}%` }}
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
        Advanced Analytics (Demo Data)
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