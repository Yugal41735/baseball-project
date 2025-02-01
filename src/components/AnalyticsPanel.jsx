import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import { Image, Trophy, X, LineChart, TrendingUp, Activity, BarChart2 } from 'lucide-react';

const AnalyticsPanel = ({ gameData, gameStatus }) => {
  console.log("Game Status Analytics Panel: ", gameStatus);
  console.log("Game Data Analytics Panel: ", gameData);
  // const renderWinProbabilityChart = (data) => (
  //   <div className="h-64">
  //     <ResponsiveContainer width="100%" height="100%">
  //       <AreaChart data={data}>
  //         <defs>
  //           <linearGradient id="winProbGradient" x1="0" y1="0" x2="0" y2="1">
  //             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
  //             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
  //           </linearGradient>
  //         </defs>
  //         <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
  //         <XAxis 
  //           dataKey="inning" 
  //           tick={{ fill: '#6b7280' }}
  //         />
  //         <YAxis 
  //           domain={[0, 100]} 
  //           tick={{ fill: '#6b7280' }}
  //           label={{ value: 'Win Probability (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
  //         />
  //         <Tooltip 
  //           contentStyle={{ 
  //             backgroundColor: 'rgba(255, 255, 255, 0.95)',
  //             border: 'none',
  //             borderRadius: '0.375rem',
  //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  //           }}
  //         />
  //         <Legend content={() => (
  //           <div className="flex justify-center items-center mt-2">
  //             <span className="text-sm text-gray-600">Win Probability Over Time</span>
  //           </div>
  //         )} />
  //         <Area
  //           type="monotone"
  //           dataKey="probability"
  //           stroke="#3b82f6"
  //           fill="url(#winProbGradient)"
  //           strokeWidth={2}
  //         />
  //       </AreaChart>
  //     </ResponsiveContainer>
  //   </div>
  // );

  // const renderWinProbabilityChart = (data) => (
  //   <div className="h-64">
  //     <ResponsiveContainer width="100%" height="100%">
  //       <AreaChart data={data}>
  //         <defs>
  //           <linearGradient id="winProbGradient" x1="0" y1="0" x2="0" y2="1">
  //             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
  //             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
  //           </linearGradient>
  //         </defs>
  //         <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
  //         <XAxis 
  //           dataKey="inning" 
  //           tick={{ fill: '#6b7280' }}
  //         />
  //         <YAxis 
  //           domain={[0, 100]} 
  //           tick={{ fill: '#6b7280' }}
  //           tickFormatter={(value) => `${value}%`}  // Add % sign to Y-axis
  //         />
  //         <Tooltip 
  //           contentStyle={{ 
  //             backgroundColor: 'rgba(255, 255, 255, 0.95)',
  //             border: 'none',
  //             borderRadius: '0.375rem',
  //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  //           }}
  //           formatter={(value) => [`${value.toFixed(1)}%`, 'Win Probability']}  // Format tooltip values
  //           labelFormatter={(label) => `Inning: ${label}`}
  //         />
  //         <Legend content={() => (
  //           <div className="flex justify-center items-center gap-4 mt-2">
  //             <div className="flex items-center gap-2">
  //               <div className="w-3 h-3 bg-blue-500 rounded" />
  //               <span className="text-sm text-gray-600">{gameData?.teamStats?.away?.name} Win Probability</span>
  //             </div>
  //           </div>
  //         )} />
  //         <Area
  //           type="monotone"
  //           dataKey="probability"
  //           name={gameData?.teamStats?.away?.name}  // Add team name
  //           stroke="#3b82f6"
  //           fill="url(#winProbGradient)"
  //           strokeWidth={2}
  //         />
  //       </AreaChart>
  //     </ResponsiveContainer>
  //   </div>
  // );

  const transformedData = gameData?.winProbability?.map(point => ({
    ...point,
    awayProbability: point.probability,
    homeProbability: 100 - point.probability
  }));

  const renderWinProbabilityChart = (data) => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="awayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis 
            dataKey="inning" 
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '0.375rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
            labelFormatter={(label) => `Inning: ${label}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="awayProbability"
            name={`${gameData?.teamStats?.away?.name} Win %`}
            stroke="#3b82f6"
            fill="url(#awayGradient)"
            strokeWidth={2}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="homeProbability"
            name={`${gameData?.teamStats?.home?.name} Win %`}
            stroke="#ef4444"
            fill="url(#homeGradient)"
            strokeWidth={2}
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const TeamStatBar = ({ label, awayValue, homeValue, isPercentage }) => {
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
        <div className="w-24 text-left">
          <span className={`text-lg font-semibold ${
            isPercentage ? 'text-blue-600' : 'text-gray-800'
          }`}>
            {awayValue}
          </span>
        </div>
        <div className="flex-1 text-center px-4">
          <span className="text-sm font-medium text-gray-500">
            {label}
          </span>
        </div>
        <div className="w-24 text-right">
          <span className={`text-lg font-semibold ${
            isPercentage ? 'text-blue-600' : 'text-gray-800'
          }`}>
            {homeValue}
          </span>
        </div>
      </div>
    );
  };

  const KeyMomentCard = ({ play }) => {

    const isKeyMoment = (play) => {
      const type = play.type;
      const description = play.description?.toLowerCase() || '';

      // Key moments criteria
      switch (type) {
        case 'home_run':
          return true; // Always show home runs
        case 'triple':
          return true; // Always show triples
        case 'double':
          return description.includes('scores'); // Only show RBI doubles
        case 'single':
          return description.includes('scores'); // Only show RBI singles
        case 'sac_fly':
        case 'sac_bunt':
          return description.includes('scores'); // Only show run-scoring sacrifices
        case 'grounded_into_double_play':
          return true; // Always show double plays
        case 'strikeout':
          // Could enhance this with situation context
          return false; // Only show important strikeouts
        default:
          return description.includes('scores'); // Show other scoring plays
      }
    };

    const getPlayIcon = (play) => {
      const description = play.description?.toLowerCase() || '';
      const type = play.type;
      switch (type) {
        case 'home_run':
          return <Trophy className="w-5 h-5 text-yellow-500" />;
        case 'triple':
        case 'double':
          return <TrendingUp className="w-5 h-5 text-blue-500" />;
        case 'grounded_into_double_play':
          return <BarChart2 className="w-5 h-5 text-purple-500" />;
        case 'strikeout':
          return <X className="w-5 h-5 text-red-500" />;
        default:
          return description.includes('scores') ? 
            <Activity className="w-5 h-5 text-green-500" /> : 
            null;
      }
    };

    console.log("Key moments card: ",isKeyMoment(play));

    if (!isKeyMoment(play)) return null;


    return (
      <div className="group bg-white hover:bg-blue-50 p-3 rounded-lg shadow-sm transition-colors duration-200">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getPlayIcon(play)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">{play.inning}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{play.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoricalStats = () => (
    <div className="space-y-6">
      {/* Win Probability Chart */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Win Probability</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image className="w-6 h-6" />
              <span className="text-sm font-medium">{gameData?.awayTeam?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-6 h-6" />
              <span className="text-sm font-medium">{gameData?.homeTeam?.name}</span>
            </div>
          </div>
        </div>
        {renderWinProbabilityChart(gameData?.winProbability)}
      </div> */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Win Probability</h3>
        </div>
        {renderWinProbabilityChart(transformedData)}
      </div>

      {/* Team Stats and Key Moments */}
      <div className="grid grid-cols-2 gap-6">
        {/* Team Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center w-32">
              <img 
                src={`https://www.mlbstatic.com/team-logos/${gameData?.headToHead.awayTeamId}.svg`}
                alt={gameData?.teamStats?.away?.name}
                className="w-12 h-12"
              />
              {/* <span className="ml-2 font-bold text-sm">{gameData?.teamStats?.away?.name}</span> */}
            </div>
            <h3 className="font-bold text-lg">Team Stats</h3>
            <div className="flex items-center justify-end w-32">
              {/* <span className="mr-2 font-bold text-sm">{gameData?.teamStats?.home?.name}</span> */}
              <img 
                src={`https://www.mlbstatic.com/team-logos/${gameData?.headToHead.homeTeamId}.svg`}
                alt={gameData?.teamStats?.home?.name}
                className="w-12 h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <TeamStatBar
              label="Hits"
              awayValue={gameData?.teamStats?.away?.hits || 0}
              homeValue={gameData?.teamStats?.home?.hits || 0}
            />
            <TeamStatBar
              label="Runs"
              awayValue={gameData?.teamStats?.away?.runs || 0}
              homeValue={gameData?.teamStats?.home?.runs || 0}
            />
            <TeamStatBar
              label="Batting Avg"
              awayValue={gameData?.teamStats?.away?.avg || '.000'}
              homeValue={gameData?.teamStats?.home?.avg || '.000'}
              isPercentage={true}
            />
            <TeamStatBar
              label="Home Runs"
              awayValue={gameData?.teamStats?.away?.homeRuns || 0}
              homeValue={gameData?.teamStats?.home?.homeRuns || 0}
            />
            <TeamStatBar
              label="Runs Batted In"
              awayValue={gameData?.teamStats?.away?.rbi || 0}
              homeValue={gameData?.teamStats?.home?.rbi || 0}
            />
            <TeamStatBar
              label="Walks"
              awayValue={gameData?.teamStats?.away?.baseOnBalls || 0}
              homeValue={gameData?.teamStats?.home?.baseOnBalls || 0}
            />
            <TeamStatBar
              label="Strikeouts"
              awayValue={gameData?.teamStats?.away?.strikeOuts || 0}
              homeValue={gameData?.teamStats?.home?.strikeOuts || 0}
            />
            <TeamStatBar
              label="Left on Base"
              awayValue={gameData?.teamStats?.away?.leftOnBase || 0}
              homeValue={gameData?.teamStats?.home?.leftOnBase || 0}
            />
            <TeamStatBar
              label="Errors"
              awayValue={gameData?.teamStats?.away?.errors || 0}
              homeValue={gameData?.teamStats?.home?.errors || 0}
            />
          </div>
        </div>

        {/* Key Moments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">Key Moments</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {gameData?.keyPlays?.map((play, index) => (
              <KeyMomentCard key={index} play={play} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHeadToHead = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-6">Head to Head</h3>
      
      {/* Season Record Visualization */}
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
              style={{ width: `${(gameData?.headToHead?.away) * 100}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${(gameData?.headToHead?.home) * 100}%` }}
            />
            {gameData?.headToHead?.ties > 0 && (
              <div
                className="bg-gray-400"
                style={{ width: `${(gameData?.headToHead?.ties) * 100}%` }}
              />
            )}
          </div>
        </div>

      {/* Last 5 Games */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-4">Last 5 Games</h4>
        <div className="space-y-3">
          {gameData?.headToHead?.lastFiveGames?.map((game, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-4 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Image className="w-6 h-6" />
                  <span className={`text-sm ${game.winner === 'away' ? 'font-bold' : ''}`}>
                    {game.awayTeam.score}
                  </span>
                </div>
                <span className="text-gray-500">vs</span>
                <div className="flex items-center gap-2">
                  <Image className="w-6 h-6" />
                  <span className={`text-sm ${game.winner === 'home' ? 'font-bold' : ''}`}>
                    {game.homeTeam.score}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">{game.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLiveStats = () => (
    <div className="space-y-6">
      {/* Live Win Probability */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-6">Live Win Probability</h3>
        <div className="grid grid-cols-2 gap-8">
          {/* Away Team */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <div 
                className="absolute inset-0 rounded-full bg-blue-500"
                style={{
                  background: `conic-gradient(#3b82f6 ${gameData?.awayTeam?.winProbability}%, #e5e7eb 0)`
                }}
              />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Image className="w-12 h-12" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{gameData?.awayTeam?.winProbability}%</div>
              <div className="text-sm text-gray-600">{gameData?.awayTeam?.name}</div>
            </div>
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <div 
                className="absolute inset-0 rounded-full bg-red-500"
                style={{
                  background: `conic-gradient(#ef4444 ${gameData?.homeTeam?.winProbability}%, #e5e7eb 0)`
                }}
              />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Image className="w-12 h-12" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{gameData?.homeTeam?.winProbability}%</div>
              <div className="text-sm text-gray-600">{gameData?.homeTeam?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Situation Analysis */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <LineChart className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-lg">Run Expectancy</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-blue-600">
              {gameData?.runExpectancy || 0}
            </div>
            <div className="text-sm text-gray-600">Expected Runs</div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Based on current base/out situation
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="font-bold text-lg">Leverage Index</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-600">
              {gameData?.leverageIndex?.toFixed(2) || '1.00'}
            </div>
            <div className="text-sm text-gray-600">Game Pressure</div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {getLeverageDescription(gameData?.leverageIndex)}
          </div>
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Win Probability Trend</h3>
        {renderWinProbabilityChart(transformedData)}
      </div>
    </div>
  );

  // Helper function for leverage description
  const getLeverageDescription = (leverageIndex) => {
    if (!leverageIndex) return 'Average pressure situation';
    if (leverageIndex < 0.85) return 'Low pressure situation';
    if (leverageIndex < 1.15) return 'Average pressure situation';
    if (leverageIndex < 2) return 'High pressure situation';
    return 'Very high pressure situation';
  };

  return (
    <div className="p-6">
      {gameStatus === 'Final' && renderHistoricalStats() }
      {gameStatus === 'Live' && renderLiveStats() && renderHeadToHead()}
      {gameStatus === 'Preview' && renderHeadToHead()}
    </div>
  );
};

export default AnalyticsPanel;