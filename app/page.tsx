"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#19191A] flex items-center justify-center">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl font-bold text-white mb-8"
        >
          NBA Draft Prospects
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link 
            href="/bigboard"
            className="
              inline-block 
              px-8 py-4 
              bg-gray-800/20 
              text-white 
              rounded-xs 
              text-xl 
              font-semibold 
              hover:bg-gray-700 
              transition-colors 
              duration-300
            "
          >
            Explore Draft Class
          </Link>
        </motion.div>
      </div>
    </div>
  );
}