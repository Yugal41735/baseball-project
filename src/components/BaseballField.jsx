import React from 'react';
import { motion } from 'framer-motion';

const BaseballField = ({ baseRunners = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-48"
    >
      {/* SVG Baseball Diamond */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ transform: 'rotate(45deg)' }}
      >
        {/* Infield Grass */}
        <rect x="20" y="20" width="60" height="60" fill="#90EE90" />
        
        {/* Base Lines */}
        <path
          d="M50 20 L80 50 L50 80 L20 50 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        
        {/* Bases */}
        {['1B', '2B', '3B'].map((base, index) => (
          <motion.rect
            key={index}
            x={48 + (index === 1 ? 30 : 0)}
            y={18 + (index === 1 ? 30 : index === 2 ? 60 : 0)}
            width="4"
            height="4"
            fill={baseRunners.includes(base) ? '#ff4444' : '#fff'}
            stroke="#000"
            whileHover={{ scale: 1.2 }}
          />
        ))}
        
        {/* Home Plate */}
        <polygon
          points="20,50 18,48 20,46 22,48"
          fill="#fff"
          stroke="#000"
        />
        
        {/* Pitcher's Mound */}
        <circle cx="50" cy="50" r="2" fill="#D2B48C" stroke="#000" />
      </svg>
      
      {/* Status Indicators */}
      <div className="absolute top-0 left-0 p-2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full border ${
              i < baseRunners.length ? 'bg-red-500' : 'bg-white'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default BaseballField;