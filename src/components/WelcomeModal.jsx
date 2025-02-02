import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mic2, Bot, ChevronRight } from 'lucide-react';

const WelcomeModal = ({ isVisible, onClose, onStartTour }) => {
  if (!isVisible) return null;

  const steps = [
    {
      number: 1,
      title: "Select a Game",
      description: "Choose from live, upcoming, or historical MLB games.",
      icon: <Calendar className="w-5 h-5" />,
      emoji: "⚾",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: 2,
      title: "Pick Your Style",
      description: "Choose between Casual Fan, Stats Nerd, or History Buff commentary.",
      icon: <Mic2 className="w-5 h-5" />,
      emoji: "🎙️",
      color: "from-green-500 to-green-600"
    },
    {
      number: 3,
      title: "Enjoy the Experience",
      description: "Get AI commentary, stats, and ask questions to our Baseball Expert.",
      icon: <Bot className="w-5 h-5" />,
      emoji: "🤖",
      color: "from-purple-500 to-purple-600"
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to BaseballBuddy!
            </h2>
            <p className="text-gray-600 mt-2">
              Your AI-driven, data-rich companion for MLB games
            </p>
          </div>
          <span className="text-4xl">⚾</span>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.number * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Step number with gradient background */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {step.title}
                    <span className="text-xl">{step.emoji}</span>
                  </h3>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartTour}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Take the Tour
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium shadow hover:shadow-md transition-all"
          >
            Skip Tour
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;