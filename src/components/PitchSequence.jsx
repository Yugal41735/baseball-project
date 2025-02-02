import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDot, Target, AlertCircle, RotateCw, Clock } from 'lucide-react';

const PitchSequence = ({ gameState }) => {
  const getColorForPitch = (pitch) => {
    switch (pitch.result) {
      case 'strike': return 'bg-green-500';
      case 'ball': return 'bg-red-500';
      case 'foul': return 'bg-yellow-500';
      case 'in_play': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getIconForPitch = (pitch) => {
    switch (pitch.result) {
      case 'strike': return <Target className="w-4 h-4 text-green-500" />;
      case 'ball': return <CircleDot className="w-4 h-4 text-red-500" />;
      case 'foul': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'in_play': return <RotateCw className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const CountDisplay = ({ label, current, max, color }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            className="fill-none stroke-gray-200"
            strokeWidth="4"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            className={`fill-none ${color}`}
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: current / max }}
            transition={{ duration: 0.5, type: "spring" }}
          />
        </svg>
        <span className="absolute text-lg font-bold">{current}</span>
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded-lg p-6 bg-white shadow-md"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-500" />
        <h2 className="font-bold text-xl">Pitch Sequence</h2>
      </div>
      
      {/* Current At-Bat Display */}
      <div className="flex justify-around mb-8">
        <CountDisplay 
          label="Balls" 
          current={gameState?.balls || 0} 
          max={4}
          color="stroke-red-500"
        />
        <CountDisplay 
          label="Strikes" 
          current={gameState?.strikes || 0} 
          max={3}
          color="stroke-green-500"
        />
        <CountDisplay 
          label="Outs" 
          current={gameState?.outs || 0} 
          max={3}
          color="stroke-gray-500"
        />
      </div>

      {/* Pitch History */}
      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {gameState?.pitchHistory?.slice(-5).map((pitch, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1
              }}
              className="relative group"
            >
              <div className="absolute left-4 h-full w-0.5 bg-gray-200 -z-10" />
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                {getIconForPitch(pitch)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pitch.type}</span>
                    <span className="text-sm text-gray-500">{pitch.speed} MPH</span>
                  </div>
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    whileHover={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 mt-1">
                      Result: {pitch.result}
                    </p>
                  </motion.div>
                </div>
                <div className={`w-2 h-2 rounded-full ${getColorForPitch(pitch)}`} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          <span>Strike</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-red-500" />
          <span>Ball</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <span>Foul</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-blue-500" />
          <span>In Play</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PitchSequence;