import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity } from 'lucide-react';

const PitchDisplay = ({ lastPitch, gameState }) => {
  const [pitchAnimation, setPitchAnimation] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  console.log(tooltip);

  useEffect(() => {
    if (lastPitch) {
      setPitchAnimation(true);
      setTimeout(() => setPitchAnimation(false), 1000);
    }
  }, [lastPitch]);

  // Generate pitch location based on result
  const getPitchLocation = () => {
    if (!lastPitch) return { x: 0, y: 0 };
    
    if (lastPitch.result === 'strike') {
      // For strikes, keep within strike zone
      return {
        x: 32 + Math.random() * 36,
        y: 22 + Math.random() * 56
      };
    } else {
      // For balls, generate location outside strike zone
      const outside = Math.random() > 0.5;
      return outside ? {
        x: Math.random() > 0.5 ? 20 + Math.random() * 8 : 72 + Math.random() * 8,
        y: 15 + Math.random() * 70
      } : {
        x: 25 + Math.random() * 50,
        y: Math.random() > 0.5 ? 10 + Math.random() * 8 : 82 + Math.random() * 8
      };
    }
  };

  const location = getPitchLocation();

  // Define zone colors and labels
  const zones = [
    { x: 30, y: 20, width: 13.33, height: 20, label: "Top Inside" },
    { x: 43.33, y: 20, width: 13.33, height: 20, label: "Top Middle" },
    { x: 56.66, y: 20, width: 13.33, height: 20, label: "Top Outside" },
    { x: 30, y: 40, width: 13.33, height: 20, label: "Middle Inside" },
    { x: 43.33, y: 40, width: 13.33, height: 20, label: "Middle" },
    { x: 56.66, y: 40, width: 13.33, height: 20, label: "Middle Outside" },
    { x: 30, y: 60, width: 13.33, height: 20, label: "Bottom Inside" },
    { x: 43.33, y: 60, width: 13.33, height: 20, label: "Bottom Middle" },
    { x: 56.66, y: 60, width: 13.33, height: 20, label: "Bottom Outside" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded-lg p-6 bg-white shadow-md"
    >
      <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-500" />
        Pitch Visualization
      </h2>

      <div className="relative w-full" style={{ height: '300px' }}>
        {/* Strike Zone */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background */}
          <rect x="0" y="0" width="100" height="100" fill="#f8fafc" />

          {/* Batter's Box */}
          <rect
            x="20"
            y="10"
            width="60"
            height="80"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Strike Zone with Zones */}
          {zones.map((zone, index) => (
            <rect
              key={index}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill="rgba(59, 130, 246, 0.05)"
              stroke="#cbd5e1"
              strokeWidth="0.5"
              onMouseEnter={() => setTooltip({ visible: true, label: zone.label })}
              onMouseLeave={() => setTooltip({ visible: false })}
            />
          ))}

          {/* Strike Zone Border */}
          <rect
            x="30"
            y="20"
            width="40"
            height="60"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            className="stroke-dasharray-2"
          />

          {/* Pitch Trajectory */}
          {lastPitch && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: pitchAnimation ? [1, 1.2, 1] : 1 
              }}
              transition={{ 
                duration: 0.5,
                scale: {
                  duration: 1,
                  repeat: Infinity
                }
              }}
            >
              {/* Pitch Location */}
              <circle
                cx={location.x}
                cy={location.y}
                r="2.5"
                fill={lastPitch.result === 'strike' ? '#22c55e' : '#ef4444'}
              />
              {/* Outer Ring */}
              <motion.circle
                cx={location.x}
                cy={location.y}
                r="4"
                fill="none"
                stroke={lastPitch.result === 'strike' ? '#22c55e' : '#ef4444'}
                strokeWidth="1"
                animate={{
                  r: [4, 6, 4],
                  opacity: [0.8, 0.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.g>
          )}
        </svg>

        {/* Pitch Info Card */}
        <AnimatePresence>
          {lastPitch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3 }}
              className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-sm">Last Pitch</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{lastPitch.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Speed</p>
                  <p className="font-medium">{lastPitch.speed} MPH</p>
                </div>
                <div>
                  <p className="text-gray-500">Result</p>
                  <p className={`font-medium ${
                    lastPitch.result === 'strike' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {lastPitch.result}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Strike</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Ball</span>
        </div>
        {lastPitch && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500">Count:</span>
            <span className="font-medium">
              {gameState?.balls || 0}-{gameState?.strikes || 0}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PitchDisplay;