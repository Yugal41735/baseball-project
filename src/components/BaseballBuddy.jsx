import React, { useState, useEffect, useRef } from 'react';
import { Video, Brain, PlayCircle, PauseCircle, Book, Calendar, Send, ChartBar, MessageCircle } from 'lucide-react';
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

const BaseballBuddy = () => {
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
    }
  ];
  

  const personalityModes = [
    { id: 'casual', name: 'Casual Fan', description: 'Easy-going, fun explanations' },
    { id: 'stats', name: 'Stats Nerd', description: 'Deep dive into numbers' },
    { id: 'history', name: 'History Buff', description: 'Historical context and stories' }
  ];

  // Auto-scroll chat to bottom
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

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

  const handlePlaySelect = (play) => {
    setAnalyzingPlay(play);
    setActiveView('analysis');  // Auto-switch to analysis view
  };

  

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
    // console.log("Game status:", gameData.status);
    // console.log("Game state:", gameData.gameState);
    // const analytics = await mlbService.getGameAnalytics(gameId);
    // setGameAnalytics(analytics);
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
        // const homeScore = gameData.gameState?.score?.home || 0;
        // const awayScore = gameData.gameState?.score?.away || 0;
        // const winningTeamName = homeScore > awayScore ? 
        // gameData.gameState?.teams?.home?.name : 
        // gameData.gameState?.teams?.away?.name;

        // Extract colors for winning team
        // console.log("Winning Team: ", winningTeamName);
        // const colors = await commentaryGen.extractTeamColors(winningTeamName);
        // console.log('Winning team colors:', colors);

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
        
        // Set initial game state for live game
        // if (gameData.gameState) {
        //   setGameState(gameData.gameState);
        //   const analytics = await mlbService.getGameAnalytics(gameId);
        //   setGameAnalytics(analytics);
        // }
    }
  };

  const closeGameSelector = () => {
    setIsGameSelectorVisible(false);
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

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

    // Generate expert response based on game context
    // let expertResponse = "I'll need to implement the expert response logic here.";
    
    // Add AI response
    // setTimeout(() => {
    //   setChatMessages(prev => [...prev, {
    //     type: 'ai',
    //     content: expertResponse,
    //     timestamp: Date.now()
    //   }]);
    // }, 500);

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

  // const getTeamColors = async (teamId) => {
  //   const colors = await commentaryGen.extractTeamColors(teamId);
  //   console.log(`Team ${teamId} colors:`, colors);
  // };

  console.log("Hello I am game state: ",gameState);

  const renderGameView = () => (
    <div className="space-y-4">
      {/* Game Feed Section */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="relative">
          <div className="bg-gray-200 h-64 rounded flex items-center justify-center game-feed">
            <Video className="w-12 h-12 text-gray-400" />
            <span className="ml-2 text-gray-500">Game Feed Will Appear Here</span>
          </div>
          
          {/* Game Score Overlay */}
          {gameState && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${gameState.teams?.away?.id}.svg`}
                    alt={gameState.teams?.away?.name}
                    className="w-6 h-6 mr-2"
                  />
                  <span>{gameState.score.away}</span>
                </div>
                <span>-</span>
                <div className="flex items-center">
                  <span>{gameState.score.home}</span>
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${gameState.teams?.home?.id}.svg`}
                    alt={gameState.teams?.home?.name}
                    className="w-6 h-6 ml-2"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Playback Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
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
      {/* AI Commentary Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 ai-commentary">
        <h2 className="font-bold text-lg mb-4">AI Commentary</h2>
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
                {message.play && (  // Add this condition
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

      {/* Expert Chat Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 baseball-expert">
        <h2 className="font-bold text-lg mb-4">Ask Baseball Expert</h2>
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto mb-4">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-2 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-lg p-2 max-w-[80%] ${
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
              </div>
            ))}
            <div ref={chatEndRef} />
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
          {activeView === 'game' && renderGameView()}
          {activeView === 'analysis' && renderAnalysisView()}
          {activeView === 'companion' && renderCompanionView()}
        </div>
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