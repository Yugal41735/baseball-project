import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CircleDot, Target, Gauge, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const GameStats = ({ gameState }) => {
  const calculatePitchPercentages = () => {
    if (!gameState?.pitcher?.pitchCount) return [];
    
    const strikes = gameState.pitcher.strikeouts;
    const total = gameState.pitcher.pitchCount;
    const balls = total - strikes;
    
    return [
      { 
        name: 'Strikes', 
        value: (strikes / total) * 100,
        count: strikes
      },
      { 
        name: 'Balls', 
        value: (balls / total) * 100,
        count: balls
      }
    ];
  };

  const COLORS = ['#3b82f6', '#ef4444']; // Blue for strikes, red for balls

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.count} pitches ({data.value.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded-lg p-6 bg-white shadow-md"
    >
      <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        Game Statistics
      </h2>
      
      <div className="space-y-6">
        {/* Pitch Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Pitch Distribution
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calculatePitchPercentages()}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {calculatePitchPercentages().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Strikes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Balls</span>
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <CircleDot className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-gray-600">Pitch Count</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{gameState?.pitcher?.pitchCount || 0}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-600">Strikeouts</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{gameState?.pitcher?.strikeouts || 0}</p>
          </motion.div>
        </div>

        {/* Last Pitch Details */}
        {gameState?.lastPitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm"
          >
            <div className="absolute -top-2 -right-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-4 h-4 bg-blue-500 rounded-full"
              />
            </div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">Last Pitch Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium">{gameState.lastPitch.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Speed</p>
                <p className="font-medium">{gameState.lastPitch.speed} MPH</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Result</p>
                <p className="font-medium capitalize">{gameState.lastPitch.result}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GameStats;