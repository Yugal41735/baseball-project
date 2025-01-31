import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const GameStats = ({ gameState }) => {
  const calculatePitchPercentages = () => {
    if (!gameState?.pitcher?.pitchCount) return [];
    
    const total = gameState.pitcher.pitchCount;
    return [
      { name: 'Strikes', value: (gameState.pitcher.strikeouts / total) * 100 },
      { name: 'Balls', value: ((total - gameState.pitcher.strikeouts) / total) * 100 }
    ];
  };

  const COLORS = ['#3b82f6', '#ef4444']; // Blue for balls, red for strikes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded p-4 bg-white shadow-sm"
    >
      <h2 className="font-bold text-lg mb-4">Game Statistics</h2>
      
      <div className="space-y-4">
        {/* Pitch Distribution */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pitch Distribution</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calculatePitchPercentages()}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {calculatePitchPercentages().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-50 p-2 rounded hover:bg-gray-100 transition-all"
          >
            <p className="text-sm text-gray-500">Pitch Count</p>
            <p className="text-xl font-bold">{gameState?.pitcher?.pitchCount || 0}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-50 p-2 rounded hover:bg-gray-100 transition-all"
          >
            <p className="text-sm text-gray-500">Strikeouts</p>
            <p className="text-xl font-bold">{gameState?.pitcher?.strikeouts || 0}</p>
          </motion.div>
        </div>

        {/* Last Pitch Details */}
        {gameState?.lastPitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-blue-50 rounded"
          >
            <h3 className="text-sm font-medium">Last Pitch Analysis</h3>
            <div className="mt-1 text-sm text-gray-600">
              <p>Type: {gameState.lastPitch.type}</p>
              <p>Speed: {gameState.lastPitch.speed} MPH</p>
              <p>Result: {gameState.lastPitch.result}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GameStats;