import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const PlayerComparison = ({ gameState, mlbService }) => {
  const [selectedPlayers, setSelectedPlayers] = useState({
    player1: null,
    player2: null
  });
  const [rosters, setRosters] = useState({
    home: [],
    away: []
  });

  useEffect(() => {
    const loadRosters = async () => {
      if (gameState?.teams?.home?.id && gameState?.teams?.away?.id) {
        try {
          console.log('Loading rosters for teams:', {
            home: gameState.teams.home.id,
            away: gameState.teams.away.id
          });

          const [homeRoster, awayRoster] = await Promise.all([
            mlbService.getRosterWithCache(gameState.teams.home.id),
            mlbService.getRosterWithCache(gameState.teams.away.id)
          ]);
          
          console.log('Loaded rosters:', { homeRoster, awayRoster });
          
          // Ensure IDs are numbers for consistency
          const processRoster = (roster) => roster.map(player => ({
            ...player,
            id: Number(player.id)
          }));

          setRosters({
            home: processRoster(homeRoster || []),
            away: processRoster(awayRoster || [])
          });
        } catch (error) {
          console.error('Error loading rosters:', error);
        }
      }
    };

    loadRosters();
  }, [gameState?.teams?.home?.id, gameState?.teams?.away?.id, mlbService]);

  const getAllPlayers = () => {
    const allPlayers = [...rosters.home, ...rosters.away];
    console.log('All players available:', allPlayers);
    return allPlayers;
  };

  const handlePlayerSelection = (playerKey, selectedId) => {
    // Convert the selectedId to a number since select values are strings
    const numericId = Number(selectedId);
    console.log('Player selection:', { playerKey, numericId });
    
    const allPlayers = getAllPlayers();
    console.log('Available players:', allPlayers);
    
    const player = allPlayers.find(p => p.id === numericId);
    console.log('Found player:', player);
    
    if (player) {
      setSelectedPlayers(prev => ({
        ...prev,
        [playerKey]: player
      }));
    }
  };

  const compareStats = (stat1, stat2) => {
    if (stat1 === null || stat2 === null) return 'text-gray-600';
    const num1 = typeof stat1 === 'string' ? parseFloat(stat1) : stat1;
    const num2 = typeof stat2 === 'string' ? parseFloat(stat2) : stat2;
    if (isNaN(num1) || isNaN(num2)) return 'text-gray-600';
    return num1 > num2 ? 'text-green-600' : num1 < num2 ? 'text-red-600' : 'text-gray-600';
  };

  // Add this debug logging
  useEffect(() => {
    console.log('Selected Players State:', selectedPlayers);
  }, [selectedPlayers]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        Player Comparison
      </h2>

      {/* Player Selection */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {['player1', 'player2'].map(playerKey => (
          <div key={playerKey}>
            <select
              className="w-full p-2 border rounded-lg"
              onChange={(e) => handlePlayerSelection(playerKey, e.target.value)}
              value={selectedPlayers[playerKey]?.id || ''}
            >
              <option value="">Select Player</option>
              {getAllPlayers().map(player => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.team.name} - {player.position})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Rest of the component remains the same */}
      {selectedPlayers.player1 && selectedPlayers.player2 && (
        <div className="space-y-4">
          {/* Player Info */}
          <div className="grid grid-cols-2 gap-6">
            {[selectedPlayers.player1, selectedPlayers.player2].map((player, index) => (
              <div key={index} className="text-center">
                <img
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.id}/headshot/67/current`}
                  alt={player.name}
                  className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = '/placeholder-player.png';
                  }}
                />
                <div className="font-bold">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {player.position} | #{player.jerseyNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Batting Stats */}
            <div className="bg-gray-50 p-3 font-medium">Batting Stats</div>
            <div className="divide-y">
              {[
                { label: 'AVG', key: 'avg' },
                { label: 'HR', key: 'homeRuns' },
                { label: 'RBI', key: 'rbi' },
                { label: 'OPS', key: 'ops' },
                { label: 'SB', key: 'stolenBases' }
              ].map(stat => (
                <div key={stat.key} className="grid grid-cols-3 p-2">
                  <div className="text-gray-600">{stat.label}</div>
                  <div className={compareStats(
                    selectedPlayers.player1.stats?.batting?.[stat.key],
                    selectedPlayers.player2.stats?.batting?.[stat.key]
                  )}>
                    {selectedPlayers.player1.stats?.batting?.[stat.key] || '-'}
                  </div>
                  <div className={compareStats(
                    selectedPlayers.player2.stats?.batting?.[stat.key],
                    selectedPlayers.player1.stats?.batting?.[stat.key]
                  )}>
                    {selectedPlayers.player2.stats?.batting?.[stat.key] || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Pitching Stats (if applicable) */}
            {(selectedPlayers.player1.stats?.pitching || selectedPlayers.player2.stats?.pitching) && (
              <>
                <div className="bg-gray-50 p-3 font-medium">Pitching Stats</div>
                <div className="divide-y">
                  {[
                    { label: 'ERA', key: 'era' },
                    { label: 'W-L', key: 'record' },
                    { label: 'K', key: 'strikeouts' },
                    { label: 'WHIP', key: 'whip' },
                    { label: 'IP', key: 'inningsPitched' }
                  ].map(stat => (
                    <div key={stat.key} className="grid grid-cols-3 p-2">
                      <div className="text-gray-600">{stat.label}</div>
                      <div className={compareStats(
                        selectedPlayers.player1.stats?.pitching?.[stat.key],
                        selectedPlayers.player2.stats?.pitching?.[stat.key]
                      )}>
                        {selectedPlayers.player1.stats?.pitching?.[stat.key] || '-'}
                      </div>
                      <div className={compareStats(
                        selectedPlayers.player2.stats?.pitching?.[stat.key],
                        selectedPlayers.player1.stats?.pitching?.[stat.key]
                      )}>
                        {selectedPlayers.player2.stats?.pitching?.[stat.key] || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerComparison;