import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import MLBDataService from '../services/mlbDataService';

const RECENT_SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const GAME_TYPES = [
  { value: 'R', label: 'Regular Season' },
  { value: 'P', label: 'Postseason' },
  { value: 'S', label: 'Spring Training' }
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Add getDaysInMonth function
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

const GameSelector = ({ onSelectGame, isVisible, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const mlbService = new MLBDataService();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGameType, setSelectedGameType] = useState('R');

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Live':
        return {
          containerClass: 'bg-green-100 text-green-700 animate-pulse border border-green-300',
          dotClass: 'w-2 h-2 rounded-full bg-green-600 mr-1 inline-block',
          label: '● LIVE'
        };
      case 'Final':
        return {
          containerClass: 'bg-gray-100 text-gray-700 border border-gray-300',
          dotClass: '',
          label: 'Final'
        };
      case 'Preview':
        return {
          containerClass: 'bg-blue-100 text-blue-700 border border-blue-300',
          dotClass: '',
          label: 'Upcoming'
        };
      default:
        return {
          containerClass: 'bg-blue-100 text-blue-700',
          dotClass: '',
          label: status
        };
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const gamesData = await mlbService.getGamesByDate(formattedDate, selectedYear, selectedGameType);
      setGames(gamesData);
      setLoading(false);
    };

    if (isVisible) {
      fetchGames();
    }
  }, [isVisible, selectedDate, selectedYear, selectedGameType]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-blue-50">
          <h2 className="text-xl font-bold mb-2">Select a Game</h2>
          
          {/* Date Selector */}
          <div className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
            {/* Year Selection */}
            <select
              value={selectedDate.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(selectedDate);
                newDate.setFullYear(e.target.value);
                setSelectedDate(newDate);
              }}
              className="p-1 border rounded"
            >
              {RECENT_SEASONS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Month Selection */}
            <select
              value={selectedDate.getMonth()}
              onChange={(e) => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(e.target.value);
                setSelectedDate(newDate);
              }}
              className="p-1 border rounded"
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>

            {/* Day Selection */}
            <select
              value={selectedDate.getDate()}
              onChange={(e) => {
                const newDate = new Date(selectedDate);
                newDate.setDate(e.target.value);
                setSelectedDate(newDate);
              }}
              className="p-1 border rounded"
            >
              {Array.from(
                { length: getDaysInMonth(selectedDate) },
                (_, i) => i + 1
              ).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Season & Game Type Selectors */}
        <div className="flex gap-4 mt-2">
            <div className="flex-1">
                <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-2 border rounded"
                >
                {RECENT_SEASONS.map(year => (
                    <option key={year} value={year}>{year} Season</option>
                ))}
                </select>
            </div>
            <div className="flex-1">
                <select
                value={selectedGameType}
                onChange={(e) => setSelectedGameType(e.target.value)}
                className="w-full p-2 border rounded"
                >
                {GAME_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                ))}
                </select>
            </div>
        </div>

        {/* Game List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No games scheduled for this date
            </div>
          ) : (
            <div className="grid gap-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  className="w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onSelectGame(game.id);
                    onClose();
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        {/* Away Team */}
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://www.mlbstatic.com/team-logos/${game.awayTeam.id}.svg`}
                            alt={game.awayTeam.name}
                            className="w-6 h-6"
                          />
                          <div className="font-bold">
                            {game.awayTeam.name}
                          </div>
                        </div>
                        <span className="text-gray-500 font-medium">vs</span>
                        {/* Home Team */}
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://www.mlbstatic.com/team-logos/${game.homeTeam.id}.svg`}
                            alt={game.homeTeam.name}
                            className="w-6 h-6"
                          />
                          <div className="font-bold">
                            {game.homeTeam.name}
                          </div>
                        </div>
                      </div>
                      {/* Time Info */}
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(game.startTime).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {/* <div>
                      <div className="font-bold text-lg">
                        {game.awayTeam.name} @ {game.homeTeam.name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(game.startTime).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div> */}
                    {(() => {
                      const styles = getStatusStyles(game.status);
                      return (
                        <span className={`px-2 py-1 rounded-full text-sm flex items-center ${styles.containerClass}`}>
                          {styles.label}
                        </span>
                      );
                    })()}
                  </div>
                  {/* {(game.status === 'Live' || game.status === 'Final') && (
                    <div className="text-lg font-bold text-center bg-gray-50 py-1 rounded">
                      {game.awayTeam.score} - {game.homeTeam.score}
                    </div>
                  )} */}
                  {(game.status === 'Live' || game.status === 'Final') && (
                    <div className="text-lg font-bold text-center bg-gray-50 py-2 rounded mt-2 border">
                      <div className="flex justify-between items-center px-4">
                        <span>{game.awayTeam.name}</span>
                        <span className="text-xl">{game.awayTeam.score}</span>
                      </div>
                      <div className="flex justify-between items-center px-4">
                        <span>{game.homeTeam.name}</span>
                        <span className="text-xl">{game.homeTeam.score}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {game.venue}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;