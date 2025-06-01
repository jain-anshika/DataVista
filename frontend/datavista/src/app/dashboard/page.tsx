"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebaseConfig"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell
} from 'recharts';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import PredictionTab from "@/components/PredictionTab";
import { uploadFileApi } from "@/lib/api";

interface AnalysisResult {
  insights: {
    num_rows: number;
    num_columns: number;
    columns: string[];
    missing_values: Record<string, number>;
    data_types: Record<string, string>;
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

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const COLORS = ['#9333EA', '#7C3AED', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

// Animated Stars Background Component
const StarField = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 10 + 5,
          delay: Math.random() * 5,
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full opacity-80"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
            y: [0, -20, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 200],
            y: [0, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [signingOut, setSigningOut] = useState(false);

  // Get user and router from hooks
  const { user } = useAuth();
  const router = useRouter();

  // Fixed sign out function
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut(auth);
      // The AuthContext should handle the user state update automatically
      // and the page.tsx will redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  const handleHomeRedirect = () => {
    router.push('/');
  };

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
      const data = await uploadFileApi(file);
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
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-xl font-bold mb-4 text-purple-100 flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
            Dataset Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-800/20 rounded-lg">
              <span className="text-purple-200">Rows:</span>
              <span className="font-bold text-purple-100 text-lg">{analysisResults.insights.num_rows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-800/20 rounded-lg">
              <span className="text-purple-200">Columns:</span>
              <span className="font-bold text-purple-100 text-lg">{analysisResults.insights.num_columns}</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-xl font-bold mb-4 text-purple-100 flex items-center">
            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 animate-pulse"></span>
            Column Information
          </h3>
          <div className="max-h-40 overflow-y-auto custom-scrollbar">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="px-3 py-2 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Column</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Missing</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analysisResults.insights.data_types).map(([column, type], index) => (
                  <motion.tr 
                    key={column}
                    className="border-b border-purple-500/20 hover:bg-purple-800/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td className="px-3 py-2 text-sm text-purple-100 font-medium">{column}</td>
                    <td className="px-3 py-2 text-sm text-purple-200">{type}</td>
                    <td className="px-3 py-2 text-sm text-purple-200">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (analysisResults.insights.missing_values[column] || 0) > 0 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {analysisResults.insights.missing_values[column] || 0}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderPredictions = () => {
    if (!analysisResults || !analysisResults.sample_data || analysisResults.sample_data.length === 0) {
      return (
        <div className="text-center py-10 text-purple-300">
          No data available for predictions. Please analyze a dataset first.
        </div>
      );
    }

    return (
      <PredictionTab 
        data={analysisResults.sample_data}
        columns={analysisResults.insights.columns}
        dataTypes={analysisResults.insights.data_types}
        onLoading={setLoading}
      />
    );
  };

  const renderDataSample = () => {
    if (!analysisResults || !analysisResults.sample_data || analysisResults.sample_data.length === 0) return null;
    
    const columns = Object.keys(analysisResults.sample_data[0]);
    
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-purple-100 flex items-center">
          <span className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
          Data Sample
        </h3>
        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-purple-500/30">
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-3 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysisResults.sample_data.map((row, rowIndex) => (
                  <motion.tr 
                    key={rowIndex}
                    className="border-b border-purple-500/20 hover:bg-purple-800/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.1 }}
                  >
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="px-3 py-3 text-sm text-purple-200">
                        {typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column])}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
        <StarField />
        
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="flex justify-between items-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={handleHomeRedirect}
              >
                DataVista
              </motion.h1>
              <motion.button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: signingOut ? 1 : 1.05 }}
                whileTap={{ scale: signingOut ? 1 : 0.95 }}
              >
                {signingOut ? (
                  <span className="flex items-center">
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Signing Out...
                  </span>
                ) : (
                  "Sign Out"
                )}
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl p-8 mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-purple-100 flex items-center">
                <span className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Upload Data to the Galaxy
              </h2>
              
              <div 
                className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer mb-6"
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                    setError(null);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="space-y-4">
                  <p className="text-lg text-purple-200">Upload Your Data</p>
                  <p className="text-gray-400">
                    Drag and drop your CSV, Excel, or JSON file here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileUpload}
                  />
                  <motion.button
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Choose File
                  </motion.button>
                  {file && (
                    <motion.p 
                      className="text-purple-300 mt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Selected: {file.name}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <motion.button
                  onClick={analyzeData}
                  disabled={!file || loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: !file || loading ? 1 : 1.05 }}
                  whileTap={{ scale: !file || loading ? 1 : 0.95 }}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Analyzing...
                    </span>
                  ) : (
                    "🔬 Analyze Data"
                  )}
                </motion.button>
              </div>
              
              {error && (
                <motion.div 
                  className="mt-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </motion.div>

            {analysisResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl p-8"
              >
                <div className="border-b border-purple-500/30 mb-8">
                  <nav className="-mb-px flex space-x-1 overflow-x-auto">
                    {[
                      { id: "overview", label: "Overview", icon: "📊" },
                      { id: "predictions", label: "Predictions", icon: "🔮" },
                      { id: "sample", label: "Data Sample", icon: "🗃️" }
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? "border-purple-400 text-purple-100 bg-purple-800/30"
                            : "border-transparent text-purple-300 hover:text-purple-200 hover:border-purple-400/50 hover:bg-purple-800/20"
                        } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-300 rounded-t-lg flex items-center space-x-2`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </motion.button>
                    ))}
                  </nav>
                </div>
                
                <div className="mt-6">
                  {activeTab === "overview" && renderOverview()}
                  {activeTab === "predictions" && renderPredictions()}
                  {activeTab === "sample" && renderDataSample()}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <footer className="relative z-10 w-full py-4 text-center text-gray-400 text-sm">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            © 2025 DataVista by Anshika Jain. All rights reserved.
          </motion.p>
        </footer>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(107, 70, 193, 0.2);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.6);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.8);
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}