import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Brain, PlayCircle, PauseCircle, Book, Calendar, Send, ChartBar, MessageCircle, RefreshCw, ThumbsUp, ThumbsDown, X, User, Trophy, Medal, Crown } from 'lucide-react';
import CommentaryGenerator from '../services/commentaryGenerator';
import BaseballField from './BaseballField';
import PitchDisplay from './PitchDisplay';
import GameStats from './GameStats';
import PitchSequence from './PitchSequence';
import LearningMode from './LearningMode';
import GameSelector from './GameSelector';
import MLBDataService from '../services/mlbDataService';
import AnalyticsPanel from './AnalyticsPanel';
import WelcomeModal from './WelcomeModal';
import GuidedTour from './GuidedTour';
import CompletionModal from './CompletionModal';
import VictoryAnimation from './VictoryAnimation';
import PlayerComparison from './PlayerComparision';

const BaseballBuddy = ({user}) => {
  const [commentaryGen] = useState(new CommentaryGenerator());
  const [gameState, setGameState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState('casual');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isLearningModeVisible, setIsLearningModeVisible] = useState(false);
  const [isGameSelectorVisible, setIsGameSelectorVisible] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [mlbService] = useState(new MLBDataService());
  const [gameAnalytics, setGameAnalytics] = useState(null);
  const [chatMessages, setChatMessages] = useState([{
    type: 'ai',
    content: "Hi! I'm your Baseball Expert. Ask me anything about the game, rules, or stats!",
    timestamp: Date.now()
  }]);
  const [simulationState, setSimulationState] = useState({
    isLoaded: false,
    currentPlayIndex: 0,
    speed: 1, // playback speed multiplier
    totalPlays: 0
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [activeView, setActiveView] = useState('game');

  const chatEndRef = useRef(null);
  const [analyzingPlay, setAnalyzingPlay] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionType, setCompletionType] = useState('');
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [winningTeamColors, setWinningTeamColors] = useState(null);
  const [winningTeam, setWinningTeam] = useState(null);
  const [messageRatings, setMessageRatings] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [userProfile, setUserProfile] = useState({
    id: user?.id,
    name: user?.name,
    favoriteTeam: null,
    points: 0,
    badges: [],
    predictions: []
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showNotification, setShowNotification] = useState(true);
  

  const views = [
    {
      id: 'game',
      label: 'Live Game',
      icon: Video,
      description: 'Watch the game and see live updates'
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: ChartBar,
      description: 'Detailed game stats and analytics'
    },
    {
      id: 'companion',
      label: 'AI Companion',
      icon: MessageCircle,
      description: 'Get AI commentary and ask questions'
    },
    {
      id: 'predictions',
      label: 'Predict',
      icon: Trophy,
      description: 'Make predictions and earn points'
    }
  ];
  

  const personalityModes = [
    { id: 'casual', name: 'Casual Fan', description: 'Easy-going, fun explanations' },
    { id: 'stats', name: 'Stats Nerd', description: 'Deep dive into numbers' },
    { id: 'history', name: 'History Buff', description: 'Historical context and stories' }
  ];

  const quickQuestions = [
    { text: "Who's pitching?", category: "players" },
    { text: "What's the score?", category: "game" },
    { text: "Last key play?", category: "plays" },
    { text: "Current situation?", category: "game" },
    { text: "Batting stats?", category: "stats" },
    { text: "Pitching stats?", category: "stats" }
  ];

  

  const handlePrediction = (type, prediction) => {
    setPredictions(prev => [...prev, {
      id: Date.now(),
      type,
      prediction,
      gameId: selectedGameId,
      timestamp: new Date(),
      status: 'pending'
    }]);

    // Add visual feedback
    const input = document.querySelector('input[type="number"]');
    if (input) input.value = ''; // Clear input after prediction
    
    // Show some feedback to user
    setUserProfile(prev => ({
      ...prev,
      predictions: prev.predictions + 1  // Track number of predictions made
    }));
    
  };
  

  const checkPredictions = useCallback((gameState) => {
    const checkNewBadges = (points) => {
      const badges = [...userProfile.badges];
      if (points >= 100 && !badges.includes('rookie')) {
        badges.push('rookie');
      }
      if (points >= 500 && !badges.includes('pro')) {
        badges.push('pro');
      }
      return badges;
    };
    predictions.forEach(prediction => {
      if (prediction.status === 'pending') {
        let isCorrect = false;
        switch (prediction.type) {
          case 'winner':
            isCorrect = gameState.winner && gameState.winner.name === prediction.prediction;
            break;
          case 'mvp':
            isCorrect = gameState.mvp && gameState.mvp.name === prediction.prediction;
            break;
          case 'scoreline':
            isCorrect = gameState.scoreline === prediction.prediction;
            break;
          default:
            break;
        }
        
        if (isCorrect) {
          setUserProfile(prev => ({
            ...prev,
            points: prev.points + 10,
            badges: checkNewBadges(prev.points + 10)
          }));
  
          const pointsEarned = 10;
  
          setLeaderboardData(prev => {
            const existingUserIndex = prev.findIndex(item => item.id === user.id);
            if (existingUserIndex !== -1) {
              const updatedData = [...prev];
              updatedData[existingUserIndex].points += pointsEarned;
              return updatedData.sort((a, b) => b.points - a.points);
            } else {
              return [...prev, {
                id: user.id,
                name: user.displayName,
                points: pointsEarned,
                predictions: 1
              }].sort((a, b) => b.points - a.points);
            }
          });
        }
      }
    });
  }, [predictions, user, setLeaderboardData, setUserProfile, userProfile.badges]);

  const Leaderboard = ({ data, currentUserId }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Prediction Leaders</h2>
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-2">
          {data.slice(0, 10).map((user, index) => (
            <div 
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.id === currentUserId ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  index === 2 ? 'text-amber-600' :
                  'text-gray-500'
                }`}>
                  #{index + 1}
                </span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{user.points}</span>
                <span className="text-sm text-gray-500">pts</span>
                {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  


  

  const renderPredictionsView = () => (
    <div className="space-y-4">
      {/* Upper achievements and stats (already populated by renderUserAchievements) */}
      {renderUserAchievements()}
  
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Make Your Predictions</h2>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{userProfile.points} pts</span>
          </div>
        </div>
  
        {(!gameState || gameState.status === 'Final') ? (
          // If there’s no game state or the game is finished, don’t allow predictions.
          <p className="text-gray-600">
            No predictions to do or match has already been played.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Predict Winner */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Predict Winner</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrediction('winner', gameState.teams.away.name)}
                  className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                >
                  {gameState.teams.away.name}
                </button>
                <button
                  onClick={() => handlePrediction('winner', gameState.teams.home.name)}
                  className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                >
                  {gameState.teams.home.name}
                </button>
              </div>
            </div>
  
            {/* Predict MVP */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Predict MVP</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Enter MVP's name"
                  id="mvpPrediction"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('mvpPrediction');
                    if (input && input.value.trim()) {
                      handlePrediction('mvp', input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Predict
                </button>
              </div>
            </div>
  
            {/* Predict Scoreline */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Predict Scoreline</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  placeholder="e.g., 5-3"
                  id="scorelinePrediction"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('scorelinePrediction');
                    if (input && input.value.trim()) {
                      handlePrediction('scoreline', input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Predict
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Top Predictors</h2>
          <Medal className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-2">
          {leaderboardData.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                  #{index + 1}
                </span>
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{user.points}</span>
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
        
      {/* Toggle Leaderboard button */}
      <button
        onClick={() => setShowLeaderboard(prev => !prev)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Trophy className="w-6 h-6" />
      </button>
  
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-4">
              <Leaderboard data={leaderboardData} currentUserId={user?.id} />
            </div>
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  useEffect(() => {
    const visited = localStorage.getItem('hasVisited');
    if (!visited) {
      // If there's no record, show the welcome modal
      setShowWelcome(true);
      // Then set that they've visited, so next time we skip it
      localStorage.setItem('hasVisited', 'true');
    } 
    // If visited is 'true', do nothing; user won't see the welcome again
  }, []);

  useEffect(() => {
    setLeaderboardData([
      { id: 1, name: "John Doe", points: 100, predictions: 15 },
      { id: 2, name: "Jane Smith", points: 85, predictions: 12 },
      { id: 3, name: "Mike Johnson", points: 70, predictions: 10 },
      { id: 4, name: "Sarah Wilson", points: 65, predictions: 8 },
      { id: 5, name: "Tom Brown", points: 50, predictions: 6 }
    ]);
  }, []);

  const handlePlaySelect = (play) => {
    setAnalyzingPlay(play);
    setActiveView('analysis');  // Auto-switch to analysis view
  };

  useEffect(() => {
    if (gameState) {
      checkPredictions(gameState);
    }
  }, [gameState, checkPredictions]);

  const [userAchievements, setUserAchievements] = useState({
    points: 75,
    badges: [
      { id: 1, name: 'Rookie Predictor', icon: '🎯', description: 'Made your first prediction', earned: '2024-02-01' },
      { id: 2, name: 'Hot Streak', icon: '🔥', description: '5 correct predictions in a row', earned: '2024-02-15' },
      { id: 3, name: 'Expert Analyst', icon: '📊', description: 'Reached 50 points', earned: '2024-02-20' },
    ],
    recentPredictions: [
      { id: 1, type: 'Winner', prediction: 'Yankees', result: 'correct', points: 10, date: '2024-02-25' },
      { id: 2, type: 'Score', prediction: '5-3', result: 'incorrect', points: 0, date: '2024-02-24' },
      { id: 3, type: 'MVP', prediction: 'Judge', result: 'pending', points: null, date: '2024-02-23' }
    ]
  });
  
  // Add this section to your renderPredictionsView
  const renderUserAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* User Stats Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Your Stats</h3>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-xl">{userAchievements.points}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {userAchievements.badges.map(badge => (
            <div 
              key={badge.id}
              className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg"
            >
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <div className="font-medium text-sm">{badge.name}</div>
                <div className="text-xs text-gray-500">{new Date(badge.earned).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
  
      {/* Recent Predictions Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4">Recent Predictions</h3>
        <div className="space-y-3">
          {userAchievements.recentPredictions.map(prediction => (
            <div 
              key={prediction.id}
              className="flex justify-between items-center p-2 rounded-lg bg-gray-50"
            >
              <div>
                <div className="font-medium">{prediction.type}</div>
                <div className="text-sm text-gray-500">{prediction.prediction}</div>
              </div>
              <div className="flex items-center gap-2">
                {prediction.result === 'correct' && (
                  <span className="text-green-500">✓</span>
                )}
                {prediction.result === 'incorrect' && (
                  <span className="text-red-500">✗</span>
                )}
                {prediction.result === 'pending' && (
                  <span className="text-yellow-500">⋯</span>
                )}
                <span className="text-sm">
                  {prediction.result === 'pending' ? 'Pending' : `${prediction.points} pts`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  

  const handleGameSelect = async (gameId) => {
    setSelectedGameId(gameId);
    setIsPlaying(false);
    setMessages([]);
    setGameState(null);
    setGameAnalytics(null);
    setSimulationState({  // Reset simulation state completely
      isLoaded: false,
      currentPlayIndex: 0,
      speed: 1,
      totalPlays: 0
    });
    
    // First check the game status
    console.log("Game selected:", gameId);
    const gameData = await mlbService.getLiveGameData(gameId);
    console.log("Game Data: ",gameData.gameData);

    if (gameData.gameState) {
      setGameState({
        ...gameData.gameState,
        status: gameData.status
    });
      const analytics = await mlbService.getGameAnalytics(gameId);
      setGameAnalytics(analytics);
    }


    
    if (gameData.status === 'Final') {
        // Load historical game data
        const historicalData = await mlbService.loadHistoricalGame(gameId);

        if (historicalData.status === 'loaded') {
            setSimulationState(prev => ({
                ...prev,
                isLoaded: true,
                currentPlayIndex: 0,
                totalPlays: historicalData.totalPlays
            }));

            const homeScore = gameData.gameState?.score?.home || 0;
            const awayScore = gameData.gameState?.score?.away || 0;
            const winner = homeScore > awayScore ? 
                gameData.gameData.teams.home : 
                gameData.gameData.teams.away;
            
            // Get colors for winning team
            const colors = await commentaryGen.extractTeamColors(winner.name);
            setWinningTeamColors(colors);
            setWinningTeam(winner);
            setShowVictoryAnimation(true);
            
            setMessages([{
                type: 'ai',
                content: `Welcome to ${historicalData.gameInfo.awayTeam} vs ${historicalData.gameInfo.homeTeam} at ${historicalData.gameInfo.venue}!`,
                timestamp: Date.now()
            }]);
        }
    } else if(gameData.status === 'Preview') {
      console.log("Upcoming Matches");
      setMessages([{
        type: 'ai',
        content: `Welcome to the matchup between ${gameData.gameData.teams.away.name} and ${gameData.gameData.teams.home.name} at ${gameData.gameData.venue.name} on ${new Date(gameData.gameData.datetime.dateTime).toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}! The game is scheduled to start at ${new Date(gameData.gameData.datetime.dateTime).toLocaleTimeString()}.`,
        timestamp: Date.now()
      }]);
    } else {
      console.log("Live Games!!!");
        // Reset simulation state for live games
        setSimulationState(prev => ({
            ...prev,
            isLoaded: false,
            currentPlayIndex: 0
        }));
        
    }
  };

  const closeGameSelector = () => {
    setIsGameSelectorVisible(false);
  };

  console.log(setUserAchievements);


  // Update this useEffect in BaseballBuddy.jsx
  useEffect(() => {
    let interval;
    if (isPlaying && selectedGameId) {
      const updateGameState = async () => {
        console.log("Simulation state:", simulationState);
        if (simulationState.isLoaded) {
          console.log("Getting next play..."); 
          const nextPlay = mlbService.simulateNextPlay();
          console.log("Next play:", nextPlay);
          if (nextPlay) {
            console.log("Score update:", nextPlay?.score);
            setGameState({
              ...nextPlay,
              currentPlay: nextPlay
            });
            const commentary = commentaryGen.generateCommentary(nextPlay, selectedMode);
            setMessages(prev => [...prev, {
              type: 'ai',
              content: commentary,
              timestamp: Date.now()
            }]);
          } else {
            setIsPlaying(false);
          }
          return;
        }
        const gameData = await mlbService.getLiveGameData(selectedGameId);

        if (gameData.status === 'Final' || gameData.gameData?.status?.abstractGameState === 'Final') {
          // Get final game state
          console.log('Game is completed, getting final state');
          const finalGameData = await mlbService.getCompletedGameData(selectedGameId);
          setGameState(finalGameData);
          setIsPlaying(false); // Stop the updates for completed games
        } else if (gameData.status === 'Live') {
          console.log(gameData.status);
          setGameState(prevState => {
            // Only update if the state has changed
            if (JSON.stringify(prevState) !== JSON.stringify(gameData.gameState)) {
              const commentary = commentaryGen.generateCommentary(gameData.gameState, selectedMode);
              setMessages(prev => [...prev, {
                type: 'ai',
                content: commentary,
                timestamp: Date.now()
              }]);
              return gameData.gameState;
            }
            return prevState;
          });
        }
      };

      // Initial update
      updateGameState();
      // Set interval for updates
      interval = setInterval(updateGameState, simulationState.isLoaded? 10000 : 20000); // Update every 20 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedGameId, selectedMode, mlbService, simulationState, commentaryGen, setGameState, setMessages]);

  useEffect(() => {
    if (isPlaying && selectedGameId) {
      const updateAnalytics = async () => {
        const analytics = await mlbService.getGameAnalytics(selectedGameId);
        setGameAnalytics(analytics);
      };
      updateAnalytics();
    }
  }, [gameState, isPlaying, selectedGameId, mlbService, setGameAnalytics]);

  // Add chat scroll effect
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Add chat message handler
  const handleChatMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: Date.now()
    }]);


    try {
      // Get expert response
      const response = await commentaryGen.generateExpertResponse(
        message,
        gameState,
        gameAnalytics
      );
  
      // Add AI response
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: response,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Error generating expert response:', error);
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your question right now.",
        timestamp: Date.now()
      }]);
    }
  };


  console.log("Hello I am game state: ",gameState);

  const renderGameView = () => (
    <div className="space-y-4">
      {/* Game Feed Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 game-feed">
        <div className="relative">
          {/* Game Score Overlay */}
          {!gameState && (
            <div className="flex justify-center items-center space-x-8">
              {/* Away Team */}
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{gameState?.score?.away ?? 0}</span>
                <span className="text-sm text-gray-600">{gameState?.teams?.away?.name || "Away"}</span>
              </div>
              <span className="text-2xl font-bold">-</span>
              {/* Home Team */}
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{gameState?.score?.home ?? 0}</span>
                <span className="text-sm text-gray-600">{gameState?.teams?.home?.name || "Home"}</span>
              </div>
            </div>
          )}
          {gameState && (
            <div className="flex justify-center items-center space-x-8">
              {/* Away Team */}
              <div className="flex flex-col items-center">
                <img 
                  src={`https://www.mlbstatic.com/team-logos/${gameState.teams?.away?.id}.svg`}
                  alt={gameState.teams?.away?.name || "Away Team"}
                  className="w-12 h-12"
                />
                <span className="text-xl font-bold">{gameState.score?.away ?? 0}</span>
                <span className="text-sm text-gray-600">{gameState.teams?.away?.name || "Away"}</span>
              </div>
              <span className="text-2xl font-bold">-</span>
              {/* Home Team */}
              <div className="flex flex-col items-center">
                <img 
                  src={`https://www.mlbstatic.com/team-logos/${gameState.teams?.home?.id}.svg`}
                  alt={gameState.teams?.home?.name || "Home Team"}
                  className="w-12 h-12"
                />
                <span className="text-xl font-bold">{gameState.score?.home ?? 0}</span>
                <span className="text-sm text-gray-600">{gameState.teams?.home?.name || "Home"}</span>
              </div>
            </div>
          )}
          
          {/* Playback Controls */}
          <div className="mt-4 flex flex-col items-center">
            <button 
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 
                <PauseCircle className="w-8 h-8 text-blue-600" /> : 
                <PlayCircle className="w-8 h-8 text-blue-600" />
              }
            </button>
            {simulationState.isLoaded && (
              <div className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                Historical Playback
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Info & Field View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 game-info">
          <h2 className="font-bold text-lg mb-2">Game Info</h2>
          {gameState ? (
            <div className="space-y-4">
              {/* Current Situation */}
              <div className="text-center p-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">
                  {gameState.inningHalf} {gameState.inning}
                </span>
                <div className="mt-1 text-sm">
                Count: {gameState.balls}-{gameState.strikes} | 
                Outs: {gameState.outs}
                </div>
              </div>
              
              {/* Current Players */}
              <div className="grid grid-cols-2 gap-4">
                {/* At Bat */}
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm text-gray-500">At Bat</p>
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://securea.mlb.com/mlb/images/players/head_shot/${gameState.batter?.id}.jpg`}
                      alt={gameState.batter?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = '/placeholder-player.png'
                      }}
                    />
                    <div>
                      <p className="font-medium">{gameState.batter?.name || "No batter"}</p>
                      <p className="text-sm text-gray-600">AVG: {gameState.batter?.average || '.000'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Pitching */}
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm text-gray-500">Pitching</p>
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://securea.mlb.com/mlb/images/players/head_shot/${gameState.pitcher?.id}.jpg`}
                      alt={gameState.pitcher?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = '/placeholder-player.png'
                      }}
                    />
                    <div>
                      <p className="font-medium">{gameState.pitcher?.name || "No pitcher"}</p>
                      <p className="text-sm text-gray-600">
                        Pitches: {gameState.pitcher?.pitchCount || 0} | K: {gameState.pitcher?.strikeouts || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Waiting for game to start...</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 field-view">
          <h2 className="font-bold text-lg mb-2">Field View</h2>
          <BaseballField baseRunners={gameState?.baseRunners || []} />
        </div>
      </div>
    </div>
  );


  // // First, add a new component for player comparison
  // const PlayerComparison = ({ gameState }) => {
  //   const [selectedPlayers, setSelectedPlayers] = useState({
  //     player1: null,
  //     player2: null
  //   });

  //   // Get all players from both teams
  //   const getAllPlayers = () => {
  //     if (!gameState?.teams) return [];
      
  //     const homePlayers = {`https://statsapi.mlb.com/api/v1/teams/{gameState.teams.home?.id}/roster?season=2025`} || [];
  //     const awayPlayers = gameState.teams.away?.players || [];
      
  //     return [...homePlayers, ...awayPlayers].map(player => ({
  //       id: player.id,
  //       name: player.fullName,
  //       team: player.team,
  //       stats: player.stats,
  //       position: player.position
  //     }));
  //   };

  //   const compareStats = (stat1, stat2) => {
  //     return stat1 > stat2 ? 'text-green-600' : stat1 < stat2 ? 'text-red-600' : 'text-gray-600';
  //   };

  //   return (
  //     <div className="bg-white rounded-lg shadow-lg p-6">
  //       <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
  //         <Users className="w-5 h-5 text-blue-500" />
  //         Player Comparison
  //       </h2>

  //       {/* Player Selection */}
  //       <div className="grid grid-cols-2 gap-6 mb-6">
  //         {['player1', 'player2'].map(playerKey => (
  //           <div key={playerKey}>
  //             <select
  //               className="w-full p-2 border rounded-lg"
  //               onChange={(e) => setSelectedPlayers(prev => ({
  //                 ...prev,
  //                 [playerKey]: getAllPlayers().find(p => p.id === e.target.value)
  //               }))}
  //               value={selectedPlayers[playerKey]?.id || ''}
  //             >
  //               <option value="">Select Player</option>
  //               {getAllPlayers().map(player => (
  //                 <option key={player.id} value={player.id}>
  //                   {player.name} ({player.team})
  //                 </option>
  //               ))}
  //             </select>
  //           </div>
  //         ))}
  //       </div>

  //       {/* Stats Comparison */}
  //       {selectedPlayers.player1 && selectedPlayers.player2 && (
  //         <div className="space-y-4">
  //           {/* Player Info */}
  //           <div className="grid grid-cols-2 gap-6">
  //             {[selectedPlayers.player1, selectedPlayers.player2].map((player, index) => (
  //               <div key={index} className="text-center">
  //                 <img
  //                   src={`https://securea.mlb.com/mlb/images/players/head_shot/${player.id}.jpg`}
  //                   alt={player.name}
  //                   className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-gray-200"
  //                   onError={(e) => {
  //                     e.target.src = '/placeholder-player.png'
  //                   }}
  //                 />
  //                 <div className="font-bold">{player.name}</div>
  //                 <div className="text-sm text-gray-600">{player.position}</div>
  //               </div>
  //             ))}
  //           </div>

  //           {/* Stats Grid */}
  //           <div className="border rounded-lg overflow-hidden">
  //             {/* Batting Stats */}
  //             <div className="bg-gray-50 p-3 font-medium">Batting Stats</div>
  //             <div className="divide-y">
  //               {[
  //                 { label: 'AVG', key: 'avg' },
  //                 { label: 'HR', key: 'homeRuns' },
  //                 { label: 'RBI', key: 'rbi' },
  //                 { label: 'OPS', key: 'ops' },
  //                 { label: 'SB', key: 'stolenBases' }
  //               ].map(stat => (
  //                 <div key={stat.key} className="grid grid-cols-3 p-2">
  //                   <div className="text-gray-600">{stat.label}</div>
  //                   <div className={compareStats(
  //                     selectedPlayers.player1.stats?.batting?.[stat.key],
  //                     selectedPlayers.player2.stats?.batting?.[stat.key]
  //                   )}>
  //                     {selectedPlayers.player1.stats?.batting?.[stat.key] || '-'}
  //                   </div>
  //                   <div className={compareStats(
  //                     selectedPlayers.player2.stats?.batting?.[stat.key],
  //                     selectedPlayers.player1.stats?.batting?.[stat.key]
  //                   )}>
  //                     {selectedPlayers.player2.stats?.batting?.[stat.key] || '-'}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>

  //             {/* Pitching Stats (if applicable) */}
  //             {(selectedPlayers.player1.stats?.pitching || selectedPlayers.player2.stats?.pitching) && (
  //               <>
  //                 <div className="bg-gray-50 p-3 font-medium">Pitching Stats</div>
  //                 <div className="divide-y">
  //                   {[
  //                     { label: 'ERA', key: 'era' },
  //                     { label: 'W-L', key: 'record' },
  //                     { label: 'K', key: 'strikeouts' },
  //                     { label: 'WHIP', key: 'whip' },
  //                     { label: 'IP', key: 'inningsPitched' }
  //                   ].map(stat => (
  //                     <div key={stat.key} className="grid grid-cols-3 p-2">
  //                       <div className="text-gray-600">{stat.label}</div>
  //                       <div className={compareStats(
  //                         selectedPlayers.player1.stats?.pitching?.[stat.key],
  //                         selectedPlayers.player2.stats?.pitching?.[stat.key]
  //                       )}>
  //                         {selectedPlayers.player1.stats?.pitching?.[stat.key] || '-'}
  //                       </div>
  //                       <div className={compareStats(
  //                         selectedPlayers.player2.stats?.pitching?.[stat.key],
  //                         selectedPlayers.player1.stats?.pitching?.[stat.key]
  //                       )}>
  //                         {selectedPlayers.player2.stats?.pitching?.[stat.key] || '-'}
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </>
  //             )}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  const renderAnalysisView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className='pitch-display'>
          <PitchDisplay lastPitch={gameState?.lastPitch} gameState={gameState} highlightedPlay={analyzingPlay} />
        </div>
        <GameStats gameState={gameState} />
        <PitchSequence gameState={gameState} />
        <div className='analytics-panel'>
          <AnalyticsPanel 
            gameData={gameAnalytics} 
            gameStatus={gameState?.status || 'Preview'} 
          />
        </div>
      </div>

      <PlayerComparison gameState={gameState} mlbService={mlbService} />

      {analyzingPlay && (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-bold mb-2">Analyzing Play:</h3>
        <p>{analyzingPlay.description}</p>
        <div className="mt-2 flex gap-2">
          <button 
            className="text-sm text-blue-600"
            onClick={() => setActiveView('companion')}
          >
            View Commentary
          </button>
        </div>
      </div>
      )}
    </div>
  );

  const renderCompanionView = () => (
    <div className="space-y-4">
      {/* Personality Mode Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 personality-modes">
        <h2 className="font-bold text-lg mb-4">Commentary Style</h2>
        <div className="flex flex-col space-y-2">
          {personalityModes.map(mode => (
            <button
              key={mode.id}
              className={`p-2 rounded-lg flex items-center ${
                selectedMode === mode.id 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <Brain className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">{mode.name}</div>
                <div className="text-sm text-gray-500">{mode.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Commentary Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 ai-commentary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            AI Commentary
          </h2>
          <button
            onClick={() => handleChatMessage("What happened in the last play?")}
            className="text-sm text-blue-600 flex items-center gap-1 hover:bg-blue-50 p-1 rounded"
          >
            <RefreshCw className="w-4 h-4" />
            Latest Update
          </button>
        </div>
        <div className="flex-1 border rounded-lg p-4 bg-gray-50 overflow-y-auto h-[300px]">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start mb-4 ${
              message.type === 'user' ? 'justify-end' : ''
            }`}>
              <div className={`rounded-lg p-3 max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-gray-800'
              }`}>
                <p>{message.content}</p>
                {message.play && (
                  <button 
                    className="text-xs text-blue-600 mt-1"
                    onClick={() => handlePlaySelect(message.play)}
                  >
                    View Analysis
                  </button>
                )}
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );

  const FloatingExpertChat = () => (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 baseball-expert ${
      isChatOpen 
        ? 'w-96 h-[600px]' 
        : 'w-auto h-auto'
    }`}>
      {isChatOpen ? (
        <div className="bg-white rounded-lg shadow-xl flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold">Baseball Expert</h2>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-2 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="group max-w-[80%]">
                  <div className={`rounded-lg p-2 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {/* Add back the thumbs up/down feedback buttons */}
                  {message.type === 'ai' && (
                    <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-end">
                      <button
                        onClick={() => {
                          setMessageRatings(prev => ({...prev, [index]: true}));
                          // Could send feedback to backend here
                        }}
                        className={`p-1 hover:bg-gray-100 rounded ${messageRatings[index] === true ? 'text-green-500' : ''}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setMessageRatings(prev => ({...prev, [index]: false}));
                          // Could send feedback to backend here
                        }}
                        className={`p-1 hover:bg-gray-100 rounded ${messageRatings[index] === false ? 'text-red-500' : ''}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
  
          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleChatMessage(q.text)}
                    className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about the game..."
                  className="flex-1 p-2 border rounded text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleChatMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button 
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Ask about the game..."]');
                    if (input && input.value.trim()) {
                      handleChatMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );

  // Add this component for a subtle notification
const GameSelectionNotification = () => (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white rounded-lg shadow-lg p-4 border border-blue-100 animate-fade-in">
    <div className="flex items-center gap-3">
      <div className="bg-blue-50 p-2 rounded-full">
        <Calendar className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <p className="text-sm text-gray-600">
          Select a game to get the full experience
        </p>
        <button
          onClick={() => setIsGameSelectorVisible(true)}
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          Choose a game →
        </button>
      </div>
      <button 
        onClick={() => setShowNotification(false)} 
        className="text-gray-400 hover:text-gray-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);



  return (
    <>
      <WelcomeModal
        isVisible={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStartTour={() => {
          setShowWelcome(false);
          setShowTour(true);
        }}
      />
      <GuidedTour 
        isVisible={showTour}
        onClose={() => {
          setShowTour(false);
          setShowCompletionModal(true);
          setCompletionType('skipped');
        }}
        onComplete={() => {
          setShowTour(false);
          setShowCompletionModal(true);
          setCompletionType('completed');
        }}
        onViewChange={(view) => setActiveView(view)}
      />
      <CompletionModal 
        isVisible={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        type={completionType}
        onSelectGame={() => setIsGameSelectorVisible(true)}
      />
      <VictoryAnimation 
        teamName={winningTeam?.name}
        colors={winningTeamColors}
        isVisible={showVictoryAnimation}
        onComplete={() => setShowVictoryAnimation(false)}
        gameType={'R'}
      />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar Navigation */}
        <div className="w-20 bg-white border-r flex flex-col items-center py-4 nav-selector">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              data-view={view.id}
              className={`p-3 rounded-lg mb-2 flex flex-col items-center ${
                activeView === view.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <view.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{view.label}</span>
            </button>
          ))}
          
          {/* Game Controls */}
          <div className="mt-auto space-y-2 game-controls">
            <button 
              className="p-3 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setIsGameSelectorVisible(true)}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs mt-1">Games</span>
            </button>
            <button 
              className="p-3 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setIsLearningModeVisible(true)}
            >
              <Book className="w-6 h-6" />
              <span className="text-xs mt-1">Learn</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {!selectedGameId && showNotification && <GameSelectionNotification />}
          {activeView === 'game' && renderGameView()}
          {activeView === 'analysis' && renderAnalysisView()}
          {activeView === 'companion' && renderCompanionView()}
          {activeView === 'predictions' && renderPredictionsView()}
        </div>
        <FloatingExpertChat />
      </div>

      {/* Modals */}
      <LearningMode 
        gameState={gameState}
        isVisible={isLearningModeVisible}
        onClose={() => setIsLearningModeVisible(false)}
      />
      <GameSelector 
        isVisible={isGameSelectorVisible}
        onClose={closeGameSelector}
        onSelectGame={handleGameSelect}
      />
    </>
  );
};

export default BaseballBuddy;