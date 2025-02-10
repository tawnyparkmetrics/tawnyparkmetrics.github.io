"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Geometry {
  type: string;
  coordinates: number[][][];
}

interface Feature {
  type: string;
  geometry: Geometry;
  // properties?: any;
}

interface GeoJSON {
  type: string;
  features: Feature[];
}

const AnimatedBackground = () => {
  const [mapPath, setMapPath] = useState('');
  const [viewBox, setViewBox] = useState('0 0 800 600');

  useEffect(() => {
    const calculateBounds = (coordinates: number[][][]) => {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      coordinates.forEach(poly => {
        poly.forEach(point => {
          minX = Math.min(minX, point[0]);
          minY = Math.min(minY, point[1]);
          maxX = Math.max(maxX, point[0]);
          maxY = Math.max(maxY, point[1]);
        });
      });

      return { minX, minY, maxX, maxY };
    };

    // Your exact GeoJSON data
    const geoData: GeoJSON = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        // "properties": {},
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
        
        // Scale the coordinates to make them more visible
        const pathData = feature.geometry.coordinates
          .map(ring => {
            return ring
              .map((coord, i) => {
                // Scale and transform the coordinates
                const x = (coord[0] + 122) * 1000; // Adjust these multipliers to change the size
                const y = (coord[1] - 37) * 1000; // Adjust these multipliers to change the size
                return `${i === 0 ? 'M' : 'L'}${x},${y}`;
              })
              .join(' ') + 'Z';
          })
          .join(' ');
        
        allPaths.push(pathData);
      }
    });

    // Calculate bounds for viewBox
    // const bounds = calculateBounds(allCoordinates);
    // const padding = 0.01; // Adjusted for geographic coordinates
    const newViewBox = `${-100} ${-100} ${1000} ${1000}`; // Fixed viewBox for better visibility
    setViewBox(newViewBox);

    setMapPath(allPaths.join(' '));
  }, []);

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    >
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
    <main style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#19191A' }}>
      <AnimatedBackground />
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
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
    </main>
  );
}