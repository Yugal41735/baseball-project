const WelcomeModal = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to ⚾ BaseballBuddy!</h2>
          
          <p className="text-gray-600 mb-6">
            Your AI-driven, data-rich companion for MLB games—live or historical!
          </p>
  
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded">1</div>
              <div>
                <h3 className="font-medium">Select a Game</h3>
                <p className="text-sm text-gray-500">Choose from live, upcoming, or historical MLB games</p>
              </div>
            </div>
  
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded">2</div>
              <div>
                <h3 className="font-medium">Pick Your Style</h3>
                <p className="text-sm text-gray-500">Choose between Casual Fan, Stats Nerd, or History Buff commentary</p>
              </div>
            </div>
  
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded">3</div>
              <div>
                <h3 className="font-medium">Enjoy the Experience</h3>
                <p className="text-sm text-gray-500">Get AI commentary, stats, and ask questions to our Baseball Expert</p>
              </div>
            </div>
          </div>
  
          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </div>
    );
};

export default WelcomeModal;