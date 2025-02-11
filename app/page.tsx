"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Barlow } from 'next/font/google';

interface Geometry {
  type: string;
  coordinates: number[][][];
}

interface Feature {
  type: string;
  geometry: Geometry;
}

interface GeoJSON {
  type: string;
  features: Feature[];
}

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700'],
});

interface NavigationHeaderProps {
  activeTab?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab }) => {
  const tabs = [
    { name: 'Home', href: '/' },
    { name: 'Draft Board', href: '/bigboard' },
  ];

  return (
    <>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#19191A] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${activeTab === tab.name 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/20 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }
                  `}
                >
                  {tab.name}
                </Link>
              ))}
            </div>

            {/* TPM Logo */}
            <div className={`${barlow.className} text-4xl font-bold text-white italic`}>
              TPM
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer div to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>
    </>
  );
};

const AnimatedBackground = () => {
  const [mapPath, setMapPath] = useState('');
  const [viewBox, setViewBox] = useState('0 0 800 600');

  useEffect(() => {
    const geoData: GeoJSON = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "coordinates": [[
            [-121.90803713349084, 37.68708129080545],
            [-121.90803713349084, 37.65412194608976],
            [-121.8624463047484, 37.65412194608976],
            [-121.8624463047484, 37.68708129080545],
            [-121.90803713349084, 37.68708129080545]
          ]],
          "type": "Polygon"
        }
      }]
    };

    const allPaths: string[] = [];
    let allCoordinates: number[][][] = [];

    geoData.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        allCoordinates = allCoordinates.concat(feature.geometry.coordinates);
        
        const pathData = feature.geometry.coordinates
          .map(ring => {
            return ring
              .map((coord, i) => {
                const x = (coord[0] + 122) * 1000;
                const y = (coord[1] - 37) * 1000;
                return `${i === 0 ? 'M' : 'L'}${x},${y}`;
              })
              .join(' ') + 'Z';
          })
          .join(' ');
        
        allPaths.push(pathData);
      }
    });

    const newViewBox = `${-100} ${-100} ${1000} ${1000}`;
    setViewBox(newViewBox);
    setMapPath(allPaths.join(' '));
  }, []);

  return (
    <div className="absolute inset-0 z-0" >
      <motion.svg 
        width="100%" 
        height="100%" 
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        {mapPath && (
          <motion.path
            d={mapPath}
            fill="none"
            stroke="#4A90E2"
            strokeWidth="2"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.3, pathLength: 1 }}
            transition={{ 
              opacity: { duration: 0.5 },
              pathLength: { duration: 2, ease: "easeInOut" }
            }}
          />
        )}

        <motion.circle
          cx="400"
          cy="300"
          r="20"
          fill="#4A90E2"
          opacity="0.2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        />
      </motion.svg>
    </div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Home" />
      <AnimatedBackground />
    </main>
  );
}