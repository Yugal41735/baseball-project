import React from 'react';
import { motion } from 'framer-motion';

const PitchSequence = ({ gameState }) => {
  const getColorForPitch = (pitch) => {
    switch (pitch.result) {
      case 'strike': return 'bg-red-500';
      case 'ball': return 'bg-blue-500';
      case 'foul': return 'bg-yellow-500';
      case 'in_play': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded p-4 bg-white shadow-sm"
    >
      <h2 className="font-bold text-lg mb-2">Pitch Sequence</h2>
      
      {/* Current At-Bat Display */}
      <div className="flex gap-2 mb-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded"
        >
          {gameState?.balls || 0}B
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 flex items-center justify-center bg-red-100 rounded"
        >
          {gameState?.strikes || 0}S
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded"
        >
          {gameState?.outs || 0}O
        </motion.div>
      </div>

      {/* Pitch History */}
      <div className="space-y-2">
        {gameState?.pitchHistory?.slice(-5).map((pitch, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-all"
          >
            <div className={`w-3 h-3 rounded-full ${getColorForPitch(pitch)}`} />
            <span className="text-sm font-medium">{pitch.type}</span>
            <span className="text-sm text-gray-500">{pitch.speed} MPH</span>
            <span className="text-xs text-gray-400 ml-auto">{pitch.result}</span>
          </motion.div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          Strike
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          Ball
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          Foul
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          In Play
        </div>
      </div>
    </motion.div>
  );
};

export default PitchSequence;