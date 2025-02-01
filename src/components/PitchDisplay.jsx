import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PitchDisplay = ({ lastPitch, gameState }) => {
  const [pitchAnimation, setPitchAnimation] = useState(false);

  useEffect(() => {
    if (lastPitch) {
      setPitchAnimation(true);
      setTimeout(() => setPitchAnimation(false), 1000);
    }
  }, [lastPitch]);

  // Generate random pitch location
  const getPitchLocation = () => {
    return {
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
    };
  };

  const location = getPitchLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded p-4 bg-white shadow-sm"
    >
      <h2 className="font-bold text-lg mb-2">Pitch Visualization</h2>
      <div className="relative w-full" style={{ height: '200px' }}>
        {/* Strike Zone */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Batter's Box */}
          <rect
            x="20"
            y="10"
            width="60"
            height="80"
            fill="none"
            stroke="#ccc"
            strokeWidth="1"
          />

          {/* Strike Zone */}
          <rect
            x="30"
            y="20"
            width="40"
            height="60"
            fill="none"
            stroke="#666"
            strokeWidth="2"
            strokeDasharray="4"
          />

          {/* Zone Grid */}
          {[1, 2].map((x) => (
            <line
              key={`vertical-${x}`}
              x1={30 + (x * 40 / 3)}
              y1="20"
              x2={30 + (x * 40 / 3)}
              y2="80"
              stroke="#ddd"
              strokeWidth="1"
            />
          ))}
          {[1, 2].map((y) => (
            <line
              key={`horizontal-${y}`}
              x1="30"
              y1={20 + (y * 60 / 3)}
              x2="70"
              y2={20 + (y * 60 / 3)}
              stroke="#ddd"
              strokeWidth="1"
            />
          ))}

          {/* Pitch Location */}
          {lastPitch && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: pitchAnimation ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <circle
                cx={location.x}
                cy={location.y}
                r="2"
                fill={lastPitch.result === 'strike' ? '#ef4444' : '#3b82f6'}
              />
              <circle
                cx={location.x}
                cy={location.y}
                r="4"
                fill="none"
                stroke={lastPitch.result === 'strike' ? '#ef4444' : '#3b82f6'}
                strokeWidth="1"
                opacity="0.5"
              />
            </motion.g>
          )}
        </svg>

        {/* Pitch Info Overlay */}
        {lastPitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded text-sm opacity-80"
          >
            {lastPitch.type}: {lastPitch.speed} MPH
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
          Strike
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
          Ball
        </div>
      </div>
    </motion.div>
  );
};

export default PitchDisplay;