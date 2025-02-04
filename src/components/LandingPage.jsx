import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Activity, BarChart2, MessageCircle } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Live Game Analysis",
      description: "Real-time MLB game tracking with advanced analytics and predictions."
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "Deep Statistics",
      description: "Comprehensive stats for every player, team, and game situation."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "AI Commentary",
      description: "Get intelligent insights and answers to your baseball questions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/logo.jpg"  // Changed to .jpg
                alt="BaseballBuddy Logo" 
                className="h-8 w-auto"
              />
              <span className="text-2xl font-bold text-blue-600">⚾ BaseballBuddy</span>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered Baseball Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience baseball like never before with real-time analytics, AI commentary, 
            and deep insights into every game.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2025 BaseballBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;