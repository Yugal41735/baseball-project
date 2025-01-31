import React from 'react';
import { motion } from 'framer-motion';

const WelcomeModal = ({ isVisible, onClose, onStartTour }) => {
  if (!isVisible) return null;

  const steps = [
    {
      number: 1,
      title: "Select a Game",
      description: "Choose from live, upcoming, or historical MLB games.",
      icon: "⚾",
    },
    {
      number: 2,
      title: "Pick Your Style",
      description: "Choose between Casual Fan, Stats Nerd, or History Buff commentary.",
      icon: "🎙️",
    },
    {
      number: 3,
      title: "Enjoy the Experience",
      description: "Get AI commentary, stats, and ask questions to our Baseball Expert.",
      icon: "🤖",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4">Welcome to ⚾ BaseballBuddy!</h2>
        
        <p className="text-gray-600 mb-6">
          Your AI-driven, data-rich companion for MLB games—live or historical!
        </p>

        <div className="space-y-4">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.number * 0.2 }}
              className="flex items-start gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-blue-100 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <span className="text-lg">{step.icon}</span>
              </motion.div>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartTour}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Take the Tour
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all"
          >
            Skip Tour
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;