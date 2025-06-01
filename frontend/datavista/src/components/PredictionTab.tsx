"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#9333EA', '#7C3AED', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

interface PredictionTabProps {
  data: Record<string, any>[];
  columns: string[];
  dataTypes: Record<string, string>;
}

export default function PredictionTab({ data, columns, dataTypes }: PredictionTabProps) {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  
  // Get numerical columns
  const numericalColumns = columns.filter(col => 
    dataTypes[col] === 'number' || dataTypes[col] === 'integer'
  );

  // Set first numerical column as default selected
  useEffect(() => {
    if (numericalColumns.length > 0 && !selectedColumn) {
      setSelectedColumn(numericalColumns[0]);
    }
  }, [numericalColumns]);

  // Basic statistics calculation
  const calculateBasicStats = (column: string) => {
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
      : sorted[Math.floor(sorted.length/2)];
    
    return { min, max, avg, median, count: values.length };
  };

  // Render histogram data
  const renderHistogramData = (column: string) => {
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binSize = range / binCount;
    
    const bins = Array(binCount).fill(0).map((_, i) => {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = values.filter(v => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length;
      return {
        name: `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`,
        value: count
      };
    });
    
    return bins;
  };

  // Render summary statistics
  const renderSummaryStats = () => {
    if (!selectedColumn) return null;
    const stats = calculateBasicStats(selectedColumn);
    if (!stats) return <p>No valid numerical data in this column</p>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
        >
          <h4 className="text-xl font-bold mb-4 text-purple-100">Column Statistics</h4>
          <div className="space-y-2 text-purple-200">
            <p><span className="font-semibold">Column:</span> {selectedColumn}</p>
            <p><span className="font-semibold">Count:</span> {stats.count}</p>
            <p><span className="font-semibold">Min:</span> {stats.min.toFixed(2)}</p>
            <p><span className="font-semibold">Max:</span> {stats.max.toFixed(2)}</p>
            <p><span className="font-semibold">Average:</span> {stats.avg.toFixed(2)}</p>
            <p><span className="font-semibold">Median:</span> {stats.median.toFixed(2)}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
        >
          <h4 className="text-xl font-bold mb-4 text-purple-100">Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renderHistogramData(selectedColumn)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C3AED40" />
                <XAxis dataKey="name" tick={{ fill: '#C4B5FD', fontSize: 12 }} />
                <YAxis tick={{ fill: '#C4B5FD', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#581C87',
                    border: '1px solid #7C3AED',
                    borderRadius: '8px',
                    color: '#E9D5FF'
                  }}
                />
                <Bar dataKey="value" fill="#6366F1" name="Frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    );
  };

  // Render correlation visualization
  const renderCorrelation = () => {
    if (numericalColumns.length < 2) {
      return <p className="text-purple-200">Not enough numerical columns for correlation analysis</p>;
    }
    
    // Simple correlation matrix (first 5 columns for performance)
    const colsToAnalyze = numericalColumns.slice(0, 5);
    const correlationData = colsToAnalyze.map(col1 => {
      const row: any = { name: col1 };
      colsToAnalyze.forEach(col2 => {
        const values1 = data.map(row => parseFloat(row[col1])).filter(v => !isNaN(v));
        const values2 = data.map(row => parseFloat(row[col2])).filter(v => !isNaN(v));
        
        // Simple correlation calculation
        if (values1.length > 0 && values2.length > 0 && values1.length === values2.length) {
          const avg1 = values1.reduce((a, b) => a + b, 0) / values1.length;
          const avg2 = values2.reduce((a, b) => a + b, 0) / values2.length;
          
          let numerator = 0;
          let denom1 = 0;
          let denom2 = 0;
          
          for (let i = 0; i < values1.length; i++) {
            numerator += (values1[i] - avg1) * (values2[i] - avg2);
            denom1 += Math.pow(values1[i] - avg1, 2);
            denom2 += Math.pow(values2[i] - avg2, 2);
          }
          
          row[col2] = Math.round((numerator / Math.sqrt(denom1 * denom2)) * 100) / 100;
        } else {
          row[col2] = 0;
        }
      });
      return row;
    });
    
    return (
      <motion.div 
        className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
        whileHover={{ scale: 1.02 }}
      >
        <h4 className="text-xl font-bold mb-4 text-purple-100">Correlation Matrix</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-500/30">
            <thead className="bg-purple-900/20">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Column</th>
                {colsToAnalyze.map(col => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    {col.length > 10 ? `${col.substring(0, 8)}...` : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-purple-900/10 divide-y divide-purple-500/30">
              {correlationData.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-purple-100">
                    {row.name.length > 10 ? `${row.name.substring(0, 8)}...` : row.name}
                  </td>
                  {colsToAnalyze.map(col => (
                    <td key={col} className="px-4 py-2 whitespace-nowrap text-sm text-purple-100">
                      <div className="flex items-center">
                        <span className="w-16">{row[col]}</span>
                        <div className="w-full bg-purple-900/50 rounded-full h-2.5 ml-2">
                          <div 
                            className={`h-2.5 rounded-full ${row[col] > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.abs(row[col]) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-purple-100 flex items-center">
        <span className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
        Data Analysis
      </h3>
      
      <div className="border-b border-purple-500/30 mb-6">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {[
            { id: "summary", label: "Summary", icon: "📊" },
            { id: "correlation", label: "Correlation", icon: "🔗" }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
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
      
      {numericalColumns.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Select Column
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full bg-purple-900/50 border border-purple-500/50 text-purple-100 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {numericalColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      )}
      
      {activeTab === "summary" && renderSummaryStats()}
      {activeTab === "correlation" && renderCorrelation()}
      
      {numericalColumns.length === 0 && (
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6 text-center">
          <p className="text-purple-200">No numerical columns found for analysis</p>
        </div>
      )}
    </div>
  );
}