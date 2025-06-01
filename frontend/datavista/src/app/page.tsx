"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { StarField } from "@/components/StarField";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Stats data
  const stats = [
    { value: "100K+", label: "Processed Datasets" },
    { value: "95%", label: "Accuracy Rate" },
    { value: "24/7", label: "Uptime" },
    { value: "10x", label: "Faster Analysis" },
  ];

  // Testimonial data
  const testimonials = [
    {
      quote: "This platform revolutionized how we handle our data pipelines. The AI insights saved us hundreds of hours.",
      author: "Sarah Johnson",
      role: "Data Scientist at TechCorp",
      avatar: "/avatar1.svg"
    },
    {
      quote: "The most intuitive data analysis tool I've used. The visualization capabilities are outstanding.",
      author: "Michael Chen",
      role: "Analytics Director",
      avatar: "/avatar2.svg"
    },
    {
      quote: "From messy CSVs to actionable insights in minutes. Our team's productivity has skyrocketed.",
      author: "Emma Rodriguez",
      role: "Research Lead",
      avatar: "/avatar3.svg"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/galaxy.gif')] bg-cover bg-center opacity-20"></div>
      <StarField />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -100],
              x: [0, Math.random() * 100 - 50]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute rounded-full bg-purple-300"
            style={{
              width: `${Math.random() * 5 + 1}px`,
              height: `${Math.random() * 5 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 mb-4"
          >
            Smart Data Analysis Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            Process your data, find missing values, and gain powerful insights with our AI-powered analytics platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/login"
              className="inline-block px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
              }}
            >
              Get Started
            </Link>
            <Link 
              href="#features"
              className="inline-block px-8 py-3 rounded-lg font-semibold border-2 border-purple-500 text-purple-300 hover:bg-purple-900/30 transition-all duration-200"
            >
              Learn More
            </Link>
          </motion.div>
          
          {/* Animated Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16"
          >
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center"
            >
              <p className="text-sm text-purple-300 mb-2">Explore more</p>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 text-center rounded-xl backdrop-blur-sm bg-gradient-to-b from-purple-900/30 to-indigo-900/30 border border-purple-800/50"
              whileHover={{ scale: 1.05 }}
            >
              <motion.p 
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200 mb-2"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {/* Feature Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl shadow-2xl backdrop-blur-lg"
            style={{
              background: 'radial-gradient(circle at center, rgba(30, 27, 46, 0.7) 0%, rgba(46, 16, 101, 0.7) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(103, 58, 183, 0.37)'
            }}
            whileHover={{ y: -5 }}
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Data Processing</h3>
            <p className="text-gray-300 mb-4">
              Automatically detect and handle missing values, outliers, and inconsistencies in your datasets.
            </p>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href="#" className="text-purple-300 text-sm flex items-center">
                Learn more 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl shadow-2xl backdrop-blur-lg"
            style={{
              background: 'radial-gradient(circle at center, rgba(30, 27, 46, 0.7) 0%, rgba(46, 16, 101, 0.7) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(103, 58, 183, 0.37)'
            }}
            whileHover={{ y: -5 }}
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Visual Analytics</h3>
            <p className="text-gray-300 mb-4">
              Interactive charts and graphs that help you understand patterns and trends in your data.
            </p>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href="#" className="text-purple-300 text-sm flex items-center">
                Learn more 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl shadow-2xl backdrop-blur-lg"
            style={{
              background: 'radial-gradient(circle at center, rgba(30, 27, 46, 0.7) 0%, rgba(46, 16, 101, 0.7) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(103, 58, 183, 0.37)'
            }}
            whileHover={{ y: -5 }}
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">File Compatibility</h3>
            <p className="text-gray-300 mb-4">
              Easily upload and process CSV and JSON files with our intuitive interface.
            </p>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href="#" className="text-purple-300 text-sm flex items-center">
                Learn more 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* How It Works Section */}
<div className="mb-24">
  <motion.h2 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 mb-12 text-center"
  >
    How It Works
  </motion.h2>
  
  <div className="relative">
    {/* Timeline - Hidden on mobile, shown on md and up */}
    <div className="hidden md:block absolute left-1/2 h-full w-0.5 bg-gradient-to-b from-purple-500/20 via-indigo-500/50 to-transparent transform -translate-x-1/2"></div>
    
    {/* Step 1 */}
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="mb-12 flex flex-col items-center md:items-start relative"
    >
      <div className="flex flex-col md:flex-row w-full items-center">
        <div className="w-full md:w-1/2 md:pr-8 mb-6 md:mb-0 order-2 md:order-1">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 mr-4">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Upload Your Data</h3>
          </div>
          <p className="text-gray-300 ml-16 md:ml-0">
            Drag and drop your CSV or JSON files directly into our platform or connect to your database.
          </p>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-2 mb-4 md:mb-0">
          <div className="bg-gray-800/50 rounded-xl p-2 md:p-4 border border-gray-700 shadow-xl">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image 
                src="/upload-demo.svg" 
                alt="Upload Demo" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    
    {/* Step 2 */}
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
      className="mb-12 flex flex-col items-center md:items-start relative"
    >
      <div className="flex flex-col md:flex-row w-full items-center">
        <div className="w-full md:w-1/2 md:pl-8 mb-6 md:mb-0 order-2">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 mr-4">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white">AI-Powered Analysis</h3>
          </div>
          <p className="text-gray-300 ml-16 md:ml-0">
            Our algorithms automatically detect issues, clean your data, and prepare it for analysis.
          </p>
        </div>
        <div className="w-full md:w-1/2 order-1 mb-4 md:mb-0">
          <div className="bg-gray-800/50 rounded-xl p-2 md:p-4 border border-gray-700 shadow-xl">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image 
                src="/analysis-demo.svg" 
                alt="Analysis Demo" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    
    {/* Step 3 */}
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      viewport={{ once: true }}
      className="flex flex-col items-center md:items-start relative"
    >
      <div className="flex flex-col md:flex-row w-full items-center">
        <div className="w-full md:w-1/2 md:pr-8 mb-6 md:mb-0 order-2 md:order-1">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 mr-4">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Visualize & Export</h3>
          </div>
          <p className="text-gray-300 ml-16 md:ml-0">
            Explore insights through interactive visualizations and export your cleaned data with one click.
          </p>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-2 mb-4 md:mb-0">
          <div className="bg-gray-800/50 rounded-xl p-2 md:p-4 border border-gray-700 shadow-xl">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image 
                src="/visualization-demo.svg" 
                alt="Visualization Demo" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
</div>

        {/* Demo Section */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 mb-6"
          >
            See It In Action
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 shadow-xl max-w-4xl mx-auto"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image 
                src="/screenshot.svg" 
                alt="Dashboard Preview" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </div>
          </motion.div>
          
          {/* Animated CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                boxShadow: [
                  '0 4px 15px rgba(124, 58, 237, 0.4)',
                  '0 8px 25px rgba(124, 58, 237, 0.6)',
                  '0 4px 15px rgba(124, 58, 237, 0.4)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Link 
                href="/login"
                className="inline-block px-8 py-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-lg"
                style={{
                  background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)'
                }}
              >
                Start Your Free Trial Now
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 mb-12 text-center"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "What file formats do you support?",
                answer: "We currently support CSV and JSON files. We're working on adding Excel and database integrations in future updates."
              },
              {
                question: "Is my data secure with your platform?",
                answer: "Absolutely. We use industry-standard encryption for data in transit and at rest. You can also request data deletion at any time."
              },
              {
                question: "Do you offer team plans?",
                answer: "Yes! We have flexible team plans with role-based access control and collaborative features perfect for data teams."
              },
              {
                question: "How does the AI analysis work?",
                answer: "Our AI examines your data for patterns, anomalies, and missing values using advanced machine learning algorithms trained on diverse datasets."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mb-6"
              >
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="p-6 rounded-xl backdrop-blur-sm bg-gradient-to-b from-purple-900/30 to-indigo-900/30 border border-purple-800/50 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full py-12 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                DataVista
              </h2>
              <p className="text-gray-400 mt-2">AI-Powered Data Analysis</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Features</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">API</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Tutorials</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">About</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 DataVista by Anshika Jain. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}