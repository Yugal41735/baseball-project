import React, { useEffect } from 'react';

const VictoryAnimation = ({ teamName, colors, isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 3000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      <div className="relative flex flex-col items-center animate-victory-slide">
        <h1 
          className="text-6xl font-bold mb-4 animate-pulse"
          style={{ 
            color: colors[0],
            textShadow: `2px 2px 4px ${colors[1]}`
          }}
        >
          {teamName} WINS!
        </h1>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-20 animate-victory-bars"
              style={{ 
                backgroundColor: i % 2 === 0 ? colors[0] : colors[1],
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VictoryAnimation;