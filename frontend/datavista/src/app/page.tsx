'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function IntroductionPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let offset = 0;
    const speed = 2;
    const colors = ['#ff007f', '#00fff7', '#ffea00', '#ff00f7', '#00ff00'];
    const lineGap = 50; // Gap between lines

    function drawTriangles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      
      for (let j = 0; j < colors.length; j++) { // More lines with gaps
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2 + j * lineGap - (colors.length * lineGap) / 2);

        for (let i = 0; i < canvas.width; i += 40) {
          const heightFactor = (Math.sin((i + offset) * 0.02) * 50);
          const y = canvas.height / 2 - heightFactor + j * lineGap - (colors.length * lineGap) / 2;
          ctx.lineTo(i + 20, y - 50); // Upward peak
          ctx.lineTo(i + 40, y); // Downward slope
        }
        
        ctx.strokeStyle = colors[j];
        ctx.stroke();
      }

      offset += speed;
      requestAnimationFrame(drawTriangles);
    }

    drawTriangles();
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-30"></canvas>
      <div className="max-w-4xl text-center relative z-10">
        <h1 className="text-5xl font-bold text-purple-400">Advanced Data Analytics Dashboard</h1>
        <p className="mt-4 text-lg text-gray-300">
          A powerful platform to analyze, visualize, and interpret your data efficiently.
        </p>
        <div className="mt-6">
          <Link href="/login">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:opacity-80">
              Start Now
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-gray-900 p-6 rounded-xl text-center shadow-lg">
          <h2 className="text-3xl text-purple-300 font-semibold">Real-time Insights</h2>
          <p className="text-gray-400 mt-2">Get live updates and monitor your data with ease.</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl text-center shadow-lg">
          <h2 className="text-3xl text-purple-300 font-semibold">Interactive Visuals</h2>
          <p className="text-gray-400 mt-2">Use stunning charts and graphs to explore data.</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl text-center shadow-lg">
          <h2 className="text-3xl text-purple-300 font-semibold">Secure & Fast</h2>
          <p className="text-gray-400 mt-2">Built with Next.js for performance and security.</p>
        </div>
      </div>
    </div>
  );
}
