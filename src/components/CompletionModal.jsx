import React from 'react';
import { PartyPopper, CalendarClock } from 'lucide-react';
import confetti from 'canvas-confetti';

const CompletionModal = ({ isVisible, onClose, type, onSelectGame }) => {
  React.useEffect(() => {
    if (isVisible && type === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isVisible, type]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 m-4 animate-modal">
        {type === 'completed' ? (
          <>
            <div className="text-center">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Congratulations! 🎉</h2>
              <p className="text-gray-600 mb-6">
                You're all set to start your baseball journey. Let's watch your first game!
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <CalendarClock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Begin!</h2>
              <p className="text-gray-600 mb-6">
                Don't worry, you can always learn about features as you go. Let's get started!
              </p>
            </div>
          </>
        )}

        <button
          onClick={() => {
            onClose();
            onSelectGame();
            // Open game selector
          }}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-3"
        >
          Select Your First Game
        </button>
        
        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          I'll Explore First
        </button>
      </div>
    </div>
  );
};

export default CompletionModal;