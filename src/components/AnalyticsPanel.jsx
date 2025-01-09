import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table } from 'recharts';

const AnalyticsPanel = ({ gameData, gameStatus }) => {
  const renderHistoricalStats = () => (
    <div className="space-y-4">
      {/* Win Probability Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">Win Probability Chart</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gameData?.winProbability || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="inning" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="probability" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Team Stats Comparison</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Hits</span>
              <span>{gameData?.awayTeam?.hits || 0} - {gameData?.homeTeam?.hits || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Runs</span>
              <span>{gameData?.awayTeam?.runs || 0} - {gameData?.homeTeam?.runs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Errors</span>
              <span>{gameData?.awayTeam?.errors || 0} - {gameData?.homeTeam?.errors || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Key Moments</h3>
          <div className="space-y-2 text-sm">
            {gameData?.keyPlays?.map((play, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-500">{play.inning}</span>
                <span>{play.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveStats = () => (
    <div className="space-y-4">
      {/* Live Win Probability */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">Live Win Probability</h3>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-xl font-bold">{gameData?.awayTeam?.winProbability}%</div>
            <div className="text-sm text-gray-500">{gameData?.awayTeam?.name}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{gameData?.homeTeam?.winProbability}%</div>
            <div className="text-sm text-gray-500">{gameData?.homeTeam?.name}</div>
          </div>
        </div>
      </div>

      {/* Current Situation Analysis */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">Situation Analysis</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Run Expectancy</span>
            <span>{gameData?.runExpectancy || 0} runs</span>
          </div>
          <div className="flex justify-between">
            <span>Leverage Index</span>
            <span>{gameData?.leverageIndex || 1.0}</span>
          </div>
        </div>
      </div>
    </div>
  );

const renderHeadToHead = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Head to Head</h3>
      
      {/* Season Record */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600">Season Series</h4>
        <div className="flex justify-between items-center mt-2">
          <div className="text-center">
            <div className="text-xl font-bold">{gameData?.headToHead?.away || 0}</div>
            <div className="text-sm text-gray-500">{gameData?.headToHead?.awayTeamName}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{gameData?.headToHead?.home || 0}</div>
            <div className="text-sm text-gray-500">{gameData?.headToHead?.homeTeamName}</div>
          </div>
          {gameData?.headToHead?.ties > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold">{gameData?.headToHead?.ties}</div>
              <div className="text-sm text-gray-500">Ties</div>
            </div>
          )}
        </div>
      </div>
  
      {/* Win-Loss Bar */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div 
            className="bg-green-500" 
            style={{ 
              width: `${(gameData?.headToHead?.away) * 100}%` 
            }} 
          />
          <div 
            className="bg-red-500" 
            style={{ 
              width: `${(gameData?.headToHead?.home) * 100}%` 
            }} 
          />
          {gameData?.headToHead?.ties > 0 && (
            <div 
              className="bg-gray-400" 
              style={{ 
                width: `${(gameData?.headToHead?.ties) * 100}%` 
              }} 
            />
          )}
        </div>
      </div>
  
      {/* Last 5 Games */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Last 5 Games</h4>
        <div className="space-y-2">
          {gameData?.headToHead?.lastFiveGames?.map((game, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded flex justify-between items-center">
              <div className="text-sm">
                <span className={game.winner === 'away' ? 'font-bold' : ''}>
                  {game.awayTeam.score}
                </span>
                {' - '}
                <span className={game.winner === 'home' ? 'font-bold' : ''}>
                  {game.homeTeam.score}
                </span>
              </div>
              <div className="text-xs text-gray-500">{game.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {gameStatus === 'Final' && renderHistoricalStats()}
      {gameStatus === 'Live' && renderLiveStats()}
      {gameStatus === 'Preview' && renderHeadToHead()}
    </div>
  );
};

export default AnalyticsPanel;