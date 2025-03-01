// mlbDataService.js

class MLBDataService {
  constructor() {
    this.BASE_URL = 'https://statsapi.mlb.com/api/v1';
    this.LIVE_GAME_URL = 'https://statsapi.mlb.com/api/v1.1/game';
    this.initGameStats();
    this.rosterCache = new Map();
    this.statsCache = new Map();
  }

  initGameStats() {
    this.gameStats = {
      currentPitchCount: 0,
      strikeouts: 0,
      strikes: 0,
      balls: 0
    };
  }

  async getTodaysGames() {
    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const url = `${this.BASE_URL}/schedule?sportId=1&date=${today}&hydrate=team`;
      const response = await fetch(url);
      const data = await response.json();
      
      return this.formatGameSchedule(data);
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  async getLiveGameData(gamePk) {
    try {
      const url = `${this.LIVE_GAME_URL}/${gamePk}/feed/live`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.gameData && data.liveData) {
        return {
          status: data.gameData.status.abstractGameState,
          gameState: this.formatLiveGameState(data),
          gameData: data.gameData
        };
      } else {
        return {
          status: 'error',
          message: 'Invalid game data format'
        };
      }
    } catch (error) {
      console.error('Error fetching live game data:', error);
      return {
        status: 'error',
        message: error.message
      }
    }
  }

  async getGamesByDate(date, year, gameType = 'R') {
      try {
        // Format date as YYYYMMDD
        const dateObj = new Date(date);
        const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
      //   const formattedDate = date.replace(/-/g, '');
        const url = `${this.BASE_URL}/schedule?sportId=1&date=${formattedDate}&season=${year}&gameType=${gameType}&hydrate=team`;
        console.log('Fetching URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        return this.formatGameSchedule(data);
      } catch (error) {
        console.error('Error fetching games:', error);
        return [];
      }
  }

  async getMonthSchedule(year, month, gameType = 'R') {
      try {
        const url = `${this.BASE_URL}/schedule?sportId=1&season=${year}&gameType=${gameType}&startDate=${year}-${month}-01&endDate=${year}-${month}-31&hydrate=team,venue`;
        const response = await fetch(url);
        const data = await response.json();
        return this.formatSchedule(data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        return [];
      }
    }

  async getCompletedGameData(gamePk) {
    try {
      const url = `${this.LIVE_GAME_URL}/${gamePk}/feed/live`;
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        inning: 'Final',
        score: {
          away: data.liveData.linescore.teams.away.runs,
          home: data.liveData.linescore.teams.home.runs
        },
        homeTeam: data.gameData.teams.home.name,
        awayTeam: data.gameData.teams.away.name,
        status: 'Final',
        // Add other relevant final game stats
        totalPitches: data.liveData.plays.allPlays.length,
        finalPlays: data.liveData.plays.allPlays.slice(-5) // Get last 5 plays
      };
    } catch (error) {
      console.error('Error fetching completed game data:', error);
      return null;
    }
  }

  async loadHistoricalGame(gamePk) {
    try {
      const url = `${this.LIVE_GAME_URL}/${gamePk}/feed/live`;
      const response = await fetch(url);
      const data = await response.json();
      console.log("Historical game data loaded:", data.liveData.plays.allPlays.length);
      // Store all plays for simulation
      if (data.liveData && data.liveData.plays) {
        this.currentBoxscore = data.liveData.boxscore;
        this.historicalPlays = data.liveData.plays.allPlays;
        this.currentPlayIndex = 0;
        console.log("First play:", this.historicalPlays[0]);
        return {
          status: 'loaded',
          totalPlays: this.historicalPlays.length,
          gameInfo: {
              homeTeam: data.gameData.teams.home.name,
              awayTeam: data.gameData.teams.away.name,
              venue: data.gameData.venue.name
          }
        };
      }
      return { status: 'error', message: 'Invalid game data' };
    } catch (error) {
        console.error('Error loading historical game:', error);
        return { status: 'error', message: error.message };
    }
  }

  simulateNextPlay() {
    if (!this.historicalPlays || this.currentPlayIndex >= this.historicalPlays.length) {
        return null;
    }

    const play = this.historicalPlays[this.currentPlayIndex++];
    console.log("Raw play data before formatting:", play);
    const formattedPlay = this.formatPlayForSimulation(play);
    console.log("Formatted play data:", formattedPlay);
    return formattedPlay;
  }

  formatPlayForSimulation(play) {
    console.log("Raw play data:", play); // Debug log to see raw data structure

    const pitcherId = play.matchup?.pitcher?.id;
    const batterId = play.matchup?.batter?.id;

    const pitcherStats = this.getPlayerStats(pitcherId, 'pitching');
    const batterStats = this.getPlayerStats(batterId, 'batting');

    const homePlayer = this.currentBoxscore.teams.home.players[`ID${batterId}`];
    const awayPlayer = this.currentBoxscore.teams.away.players[`ID${batterId}`];
    const player = homePlayer || awayPlayer;

    const avgStat = player?.seasonStats.batting.avg;
    console.log(avgStat);

    console.log(batterStats);

    console.log("Team Info: ", this.currentBoxscore.teams);

    // const pitchesThisAtBat = play.playEvents?.length || 0;
    // this.gameStats.currentPitchCount += pitchesThisAtBat;

    // if (play.result?.eventType === 'strikeout') {
    //   this.gameStats.strikeouts += 1;
    // }

    // const strikes = play.playEvents?.filter(event => 
    //   event.details?.isStrike === true
    // ).length || 0;
    // const balls = play.playEvents?.filter(event => 
    //     event.details?.isBall === true
    // ).length || 0;

    const pitchHistory = play.playEvents
        ?.filter(event => event.isPitch)
        ?.slice(-5)
        ?.map(pitch => ({
            type: pitch.details?.type?.description || 'Unknown',
            speed: pitch.pitchData?.startSpeed || 0,
            result: this.getPitchResult(pitch)
        }));

    return {
      inning: play.about?.inning || 0,
      inningHalf: play.about?.halfInning || 'top',
      balls: play.count?.balls || 0,
      strikes: play.count?.strikes || 0,
      outs: play.count?.outs || 0,
      baseRunners: this.formatRunnersForPlay(play),
      teams: {
        home: {
          id: this.currentBoxscore.teams.home.team.id,
          name: this.currentBoxscore.teams.home.team.name
        },
        away: {
          id: this.currentBoxscore.teams.away.team.id,
          name: this.currentBoxscore.teams.away.team.name
        }
      },
      score: {
        away: play.result.awayScore || 0,
        home: play.result.homeScore || 0
      },
      batter: {
        id: play.matchup?.batter?.id || null,
        name: play.matchup?.batter?.fullName || "Unknown Batter",
        average: avgStat || '.000',
        atBats: batterStats?.atBats || 0,
        strikeouts: batterStats?.strikeOuts || 0
      },
      pitcher: {
        id: play.matchup?.pitcher?.id || null,
        name: play.matchup?.pitcher?.fullName || "Unknown Pitcher",
        pitchCount: pitcherStats?.numberOfPitches || 0,
        strikeouts: pitcherStats?.strikeOuts
      },
      lastPitch: play.playEvents && play.playEvents.length > 0 ? {
        type: play.playEvents[play.playEvents.length - 1]?.details?.type?.description || 'Unknown',
        speed: play.playEvents[play.playEvents.length - 1]?.pitchData?.startSpeed || 0,
        result: this.getPitchResult(play.playEvents[play.playEvents.length - 1])
      } : null,
      pitchHistory: pitchHistory || [],
      currentPlay: play
    };
  }

  getPlayerStats(playerId, statType) {
    if (!this.currentBoxscore || !playerId) return null;

    console.log("Box Scores: ",this.currentBoxscore);

    // Check both home and away teams
    const homePlayer = this.currentBoxscore.teams.home.players[`ID${playerId}`];
    const awayPlayer = this.currentBoxscore.teams.away.players[`ID${playerId}`];
    const player = homePlayer || awayPlayer;

    return player?.stats?.[statType] || null;
  }

  getPlayerSeasonStats(playerId) {
    if (!this.currentBoxscore || !playerId) return null;

    // console.log("Box Scores: ",this.currentBoxscore);

    // Check both home and away teams
    const homePlayer = this.currentBoxscore.teams.home.players[`ID${playerId}`];
    const awayPlayer = this.currentBoxscore.teams.away.players[`ID${playerId}`];
    const player = homePlayer || awayPlayer;

    console.log("Player Season Stats ",player);

    return player?.seasonStats || null;
  }

  formatGameSchedule(scheduleData) {
    if (!scheduleData.dates || scheduleData.dates.length === 0) {
      return [];
    }

    return scheduleData.dates[0].games.map(game => ({
      id: game.gamePk,
      status: game.status.abstractGameState,
      detailedState: game.status.detailedState,
      homeTeam: {
        id: game.teams.home.team.id,
        name: game.teams.home.team.name,
        score: game.teams.home.score || 0,
        record: game.teams.home.leagueRecord ?
            `${game.teams.home.leagueRecord.wins}-${game.teams.home.leagueRecord.losses}` : null
      },
      awayTeam: {
        id: game.teams.away.team.id,
        name: game.teams.away.team.name,
        score: game.teams.away.score || 0,
        record: game.teams.away.leagueRecord ?
            `${game.teams.away.leagueRecord.wins}-${game.teams.away.leagueRecord.losses}` : null
      },
      startTime: game.gameDate,
      venue: game.venue.name,
      gameType: game.gameType,
      description: game.description || '',
      isFeatured: game.isFeaturedGame || false
    }));
  }

  formatSchedule(scheduleData) {
      if (!scheduleData.dates) return [];
  
      return scheduleData.dates.flatMap(date =>
        date.games.map(game => ({
          id: game.gamePk,
          status: game.status.detailedState,
          homeTeam: {
            name: game.teams.home.team.name,
            score: game.teams.home.score
          },
          awayTeam: {
            name: game.teams.away.team.name,
            score: game.teams.away.score
          },
          startTime: game.gameDate,
          venue: game.venue.name,
          gameType: game.gameType
        }))
      );
  }

  formatLiveGameState(gameData) {
    console.log("Format game data: ", gameData);
    const plays = gameData.liveData.plays;
    const linescore = gameData.liveData.linescore;

    if (!plays || !linescore) {
      throw new Error('Missing required game data');
    }
    
    return {
        status: gameData.gameData.status.abstractGameState,
        inning: linescore.currentInning || 0,
        inningHalf: linescore.inningHalf || 'top',
        balls: plays.currentPlay ? plays.currentPlay.count.balls : 0,
        strikes: plays.currentPlay ? plays.currentPlay.count.strikes : 0,
        outs: linescore.outs || 0,
        baseRunners: this.getBaseRunners(linescore),
        score: {
          away: linescore.teams.away.runs || 0,
          home: linescore.teams.home.runs || 0
        },
        teams: {  // Add team info
          away: {
            id: gameData.gameData.teams.away.id,
            name: gameData.gameData.teams.away.name
          },
          home: {
            id: gameData.gameData.teams.home.id,
            name: gameData.gameData.teams.home.name
          }
        },
        pitcher: this.getCurrentPitcher(gameData),
        batter: this.getCurrentBatter(gameData),
        lastPlay: plays.currentPlay ? this.formatPlay(plays.currentPlay) : null
    };
  }

  // Add these methods to mlbDataService.js
  getBaseRunners(linescore) {
    const runners = [];
    if (linescore.offense) {
      if (linescore.offense.first) runners.push('1B');
      if (linescore.offense.second) runners.push('2B');
      if (linescore.offense.third) runners.push('3B');
    }
    return runners;
  }

  getCurrentPitcher(gameData) {
    try {
      const currentPlay = gameData.liveData.plays.currentPlay;
      if (!currentPlay || !currentPlay.matchup || !currentPlay.matchup.pitcher) return null;
  
      const pitcher = gameData.gameData.players[`ID${currentPlay.matchup.pitcher.id}`];
      if (!pitcher) return null;
  
      return {
        id: pitcher.id,
        name: pitcher.fullName || "Unknown Pitcher",
        pitchCount: (currentPlay.count && currentPlay.count.pitches) || 0,
        strikeouts: pitcher.stats && pitcher.stats.pitching ? 
          pitcher.stats.pitching.strikeOuts || 0 : 0
      };
    } catch (error) {
      console.log('Error getting pitcher data:', error);
      return {
        id: null,
        name: "Unknown Pitcher",
        pitchCount: 0,
        strikeouts: 0
      };
    }
  }

  getCurrentBatter(gameData) {
    try {
      const currentPlay = gameData.liveData.plays.currentPlay;
      if (!currentPlay || !currentPlay.matchup || !currentPlay.matchup.batter) return null;
  
      const batter = gameData.gameData.players[`ID${currentPlay.matchup.batter.id}`];
      if (!batter) return null;

      console.log("Batter info: ", batter);
  
      return {
        id: batter.id,
        name: batter.fullName || "Unknown Batter",
        average: batter.stats && batter.stats.batting ? 
          `.${Math.round(batter.stats.batting.avg * 1000)}` : '.000'
      };
    } catch (error) {
      console.log('Error getting batter data:', error);
      return {
        id: null,
        name: "Unknown Batter",
        average: '.000'
      };
    }
  }

  formatPlay(play) {
    if (!play.pitchData || !play.details) return null;
    
    return {
      type: play.details.type.description || 'Unknown Pitch',
      speed: Math.round(play.pitchData.startSpeed),
      description: play.details.description || '',
      result: this.getPitchResult(play)
    };
  }

  getPitchResult(play) {
    if (!play.details) return null;
    if (play.details.isInPlay) return 'in_play';
    if (play.details.isBall) return 'ball';
    if (play.details.isStrike) return play.details.isFoul ? 'foul' : 'strike';
    return null;
  }

  formatRunnersForPlay(play) {
    const runners = [];
    if (play.runners) {
        if (play.runners.some(r => r.movement?.end === '1B')) runners.push('1B');
        if (play.runners.some(r => r.movement?.end === '2B')) runners.push('2B');
        if (play.runners.some(r => r.movement?.end === '3B')) runners.push('3B');
    }
    return runners;
  }

  // Add these methods to MLBDataService class

  async getGameData(gamePk) {
    try {
      const url = `${this.LIVE_GAME_URL}/${gamePk}/feed/live`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching game data:', error);
      return null;
    }
  }

  async getGameAnalytics(gamePk) {
    try {
      const data = await this.getGameData(gamePk);
      const boxscore = data.liveData.boxscore;
      const plays = data.liveData.plays;
      console.log("Game Data", data.gameData);
      const dateTime = data.gameData.datetime.dateTime;
      console.log(dateTime);
      const keyPlays = this.extractKeyPlays(plays.allPlays);
      console.log("Key plays: ", keyPlays);
      
      return {
        teamStats: this.extractTeamStats(boxscore),
        winProbability: this.calculateWinProbability(plays.allPlays),
        keyPlays: keyPlays,
        headToHead: await this.getHeadToHeadRecord(
          data.gameData.teams.away.id,
          data.gameData.teams.home.id,
          dateTime
        )
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  calculateWinProbability(plays) {
    return plays.map(play => ({
      inning: `${play.about.halfInning} ${play.about.inning}`,
      probability: this.calculateProbabilityForPlay(play)
    }));
  }

  calculateProbabilityForPlay(play) {
    const base = 50; // Starting probability
    const scoreDiff = play.result.awayScore - play.result.homeScore;
    const inning = play.about.inning;
    const isHome = play.about.halfInning === 'bottom';
    
    // Basic probability calculation
    let probability = base;
    probability += scoreDiff * 10;
    probability += (inning / 9) * 5;
    probability += isHome ? 5 : -5;
    
    return Math.max(0, Math.min(100, probability));
  }

  extractKeyPlays(plays) {
    console.log("Key Plays backend: ", plays);
    return plays
      .filter(play => play.about.isScoringPlay || 
                      play.result.eventType === 'strikeout' ||
                      play.about.isComplete)
      .map(play => ({
        type: play.result.eventType,
        inning: `${play.about.halfInning} ${play.about.inning}`,
        description: play.result.description
      }));
  }

  extractTeamStats(boxScore) {
    console.log("Box scores: ", boxScore);
    return {
      home: {
        name: boxScore.teams.home.team.name,
        homeRuns: boxScore.teams.home.teamStats.batting.homeRuns,
        avg: boxScore.teams.home.teamStats.batting.avg,
        rbi: boxScore.teams.home.teamStats.batting.rbi,
        baseOnBalls: boxScore.teams.home.teamStats.batting.baseOnBalls,
        strikeouts: boxScore.teams.home.teamStats.batting.strikeOuts,
        runs: boxScore.teams.home.teamStats.batting.runs || 0,
        hits: boxScore.teams.home.teamStats.batting.hits || 0,
        errors: boxScore.teams.home.teamStats.fielding.errors || 0,
        battingAvg: boxScore.teams.home.teamStats.batting.avg || '.000',
        leftOnBase: boxScore.teams.home.teamStats.batting.leftOnBase || 0
      },
      away: {
        name: boxScore.teams.away.team.name,
        homeRuns: boxScore.teams.away.teamStats.batting.homeRuns,
        avg: boxScore.teams.away.teamStats.batting.avg,
        baseOnBalls: boxScore.teams.home.teamStats.batting.baseOnBalls,
        rbi: boxScore.teams.away.teamStats.batting.rbi,
        strikeouts: boxScore.teams.away.teamStats.batting.strikeOuts,
        runs: boxScore.teams.away.teamStats.batting.runs || 0,
        hits: boxScore.teams.away.teamStats.batting.hits || 0,
        errors: boxScore.teams.away.teamStats.fielding.errors || 0,
        battingAvg: boxScore.teams.away.teamStats.batting.avg || '.000',
        leftOnBase: boxScore.teams.away.teamStats.batting.leftOnBase || 0
      }
    };
  }

  // some error with find
  // getPitcherStats(gameData, teamType) {
  //   const pitcher = gameData.gameData.probablePitchers[teamType];
  //   const stats = this.getPlayerSeasonStats(pitcher.id).pitching;
  //   console.log("stats: ", stats);
  //   console.log("Pitcher Stats: ",pitcher);
  //   if (!pitcher) return null;

  //   return {
  //     id: pitcher.id,
  //     name: pitcher.fullName,
  //     era: stats.era || 0,
  //     whip: stats.whip || 0,
  //     record: `${stats.wins || 0}-${
  //       stats.losses || 0
  //     }`
  //   };
  // }

  // async getHeadToHeadRecord(awayTeamId, homeTeamId) {
  //   console.log("Home team: ", homeTeamId);
  //   console.log("Away team: ", awayTeamId);
  //   try {
  //     const url = `${this.BASE_URL}/teams/${homeTeamId}/record?opponents=${awayTeamId}`;
  //     const response = await fetch(url);
  //     const data = await response.json();
      
  //     return {
  //       away: data.records?.find(r => r.opponent.id === awayTeamId)?.wins || 0,
  //       home: data.records?.find(r => r.opponent.id === awayTeamId)?.losses || 0
  //     };
  //   } catch (error) {
  //     console.error('Error fetching head-to-head:', error);
  //     return { away: 0, home: 0 };
  //   }
  // }

  // async getHeadToHeadRecord(awayTeamId, homeTeamId, gameData) {
  //   console.log("Head to head data", gameData);
  //   try {
  //     // Example: Fetch all 2024 regular-season matchups between these two teams
  //     const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?` +
  //       `sportId=1` +
  //       `&teamId=${homeTeamId}` +       // "home" perspective
  //       `&opponentId=${awayTeamId}` +  // "away" perspective
  //       `&season=2024` +
  //       `&gameTypes=R` +               // R = Regular Season
  //       `&expand=schedule.teams` +
  //       `&expand=schedule.linescore`;
  
  //     // 1) Fetch the schedule
  //     const response = await fetch(scheduleUrl);
  //     const scheduleData = await response.json();
  
  //     // 2) Flatten out all games from the returned dates
  //     const allGames = (scheduleData.dates ?? []).flatMap(date => date.games ?? []);
  
  //     // 3) Sort games by date descending (most recent first)
  //     const sortedGames = allGames.sort(
  //       (a, b) => new Date(b.gameDate) - new Date(a.gameDate)
  //     );
  
  //     // 4) Slice the *last 5* matchups
  //     const lastFive = sortedGames.slice(0, 5);
  
  //     // 5) Tally wins/losses for those last 5 games
  //     let homeWins = 0;
  //     let awayWins = 0;
  
  //     lastFive.forEach(game => {
  //       const homeScore = game.teams.home.score ?? 0;
  //       const awayScore = game.teams.away.score ?? 0;
  //       if (homeScore > awayScore) {
  //         homeWins++;
  //       } else if (awayScore > homeScore) {
  //         awayWins++;
  //       }
  //       // If homeScore === awayScore (extremely rare at final), you could track ties if needed
  //     });
  
  //     // 6) Create a "lastFiveGames" summary
  //     const lastFiveGames = lastFive.map(game => {
  //       const homeTeam = game.teams.home;
  //       const awayTeam = game.teams.away;
  
  //       return {
  //         date: new Date(game.gameDate).toLocaleDateString(),
  //         homeTeam: {
  //           name: homeTeam?.team?.name,
  //           score: homeTeam?.score
  //         },
  //         awayTeam: {
  //           name: awayTeam?.team?.name,
  //           score: awayTeam?.score
  //         },
  //         winner:
  //           homeTeam.score > awayTeam.score
  //             ? "home"
  //             : homeTeam.score < awayTeam.score
  //             ? "away"
  //             : "tie",
  //         status: game.status?.detailedState,
  //         // If you need to see the tiebreaker flag:
  //         tiebreaker: game.tiebreaker // Usually 'N' or 'Y', see explanation below
  //       };
  //     });
  
  //     // 7) Return the record (just for the last 5) plus the details
  //     return {
  //       home: homeWins,
  //       away: awayWins,
  //       lastFiveGames
  //     };
  //   } catch (error) {
  //     console.error("Error fetching head-to-head:", error);
  //     return {
  //       home: 0,
  //       away: 0,
  //       lastFiveGames: []
  //     };
  //   }
  // }

  async getCachedPlayerStats(playerId) {
    const cacheKey = `stats_${playerId}`;
    const cachedData = this.statsCache.get(cacheKey);
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
  
    if (cachedData && Date.now() - cachedData.timestamp < cacheExpiry) {
      return cachedData.data;
    }
  
    const stats = await this.getPlayerSeasonAndGameStats(playerId);
    this.statsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: stats
    });
    
    return stats;
  }

  async getPlayerSeasonAndGameStats(playerId) {
    try {
      // First, get the player's season stats
      const seasonStats = await this.fetchPlayerSeasonStats(playerId);
      
      // If we have currentBoxscore (game in progress), merge with current game stats
      let gameStats = null;
      if (this.currentBoxscore) {
        const homePlayer = this.currentBoxscore.teams.home.players[`ID${playerId}`];
        const awayPlayer = this.currentBoxscore.teams.away.players[`ID${playerId}`];
        gameStats = homePlayer?.stats || awayPlayer?.stats;
      }
  
      return {
        ...seasonStats,
        gameStats: gameStats
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }
  
  async fetchPlayerSeasonStats(playerId) {
    try {
      const hittingUrl = `${this.BASE_URL}/people/${playerId}?hydrate=stats(type=season,season=2024,group=hitting)`;
      const pitchingUrl = `${this.BASE_URL}/people/${playerId}?hydrate=stats(type=season,season=2024,group=pitching)`;
      let response = await fetch(hittingUrl);
      let data = await response.json();

      console.log("Player stats of year: ",data)
  
      // Process hitting stats
      const hittingStats = data.people[0].stats?.[0].splits[0].stat || {};
      response = await fetch(pitchingUrl);
      data = await response.json();
      const pitchingStats = data.people[0].stats?.[0].splits[0].stat || {};

      console.log("Hitting stats: ", hittingStats);
      console.log("Pitching stats: ", pitchingStats);
  
      return {
        batting: {
          avg: hittingStats.avg || '.000',
          homeRuns: hittingStats.homeRuns || 0,
          rbi: hittingStats.rbi || 0,
          ops: hittingStats.ops || '.000',
          stolenBases: hittingStats.stolenBases || 0,
          hits: hittingStats.hits || 0,
          atBats: hittingStats.atBats || 0
        },
        pitching: {
          era: pitchingStats.era || '0.00',
          wins: pitchingStats.wins || 0,
          losses: pitchingStats.losses || 0,
          strikeouts: pitchingStats.strikeOuts || 0,
          whip: pitchingStats.whip || '0.00',
          inningsPitched: pitchingStats.inningsPitched || '0.0',
          record: `${pitchingStats.wins || 0}-${pitchingStats.losses || 0}`
        }
      };
    } catch (error) {
      console.error('Error fetching season stats:', error);
      return {
        batting: {},
        pitching: {}
      };
    }
  }

  async getTeamRoster(teamId, season = new Date().getFullYear()) {
    try {
      const url = `${this.BASE_URL}/teams/${teamId}/roster?season=${season}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data || !data.roster) {
        console.error('Invalid roster data received');
        return [];
      }
  
      // Process and enrich roster data
      const enrichedRoster = await Promise.all(
        data.roster.map(async player => {
          // Get detailed player stats using new method
          const playerStats = await this.getPlayerSeasonAndGameStats(player.person.id);
          // const playerStats = await this.getPlayerSeasonStats(player.person.id);

          
          
          return {
            id: player.person.id,
            name: player.person.fullName,
            position: player.position.abbreviation,
            jerseyNumber: player.jerseyNumber || 'N/A',
            status: player.status.description,
            stats: playerStats,
            team: {
              id: teamId,
              name: data.teamName || await this.getTeamName(teamId)
            }
          };
        })
      );
  
      return enrichedRoster;
    } catch (error) {
      console.error('Error fetching team roster:', error);
      return [];
    }
  }
  
  async getTeamName(teamId) {
    try {
      const url = `${this.BASE_URL}/teams/${teamId}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.teams[0]?.name || 'Unknown Team';
    } catch (error) {
      console.error('Error fetching team name:', error);
      return 'Unknown Team';
    }
  }
  
  // Cache management methods
  async cacheTeamRoster(teamId) {
    const roster = await this.getTeamRoster(teamId);
    this.rosterCache.set(teamId, {
      timestamp: Date.now(),
      data: roster
    });
    return roster;
  }
  
  async getRosterWithCache(teamId) {
    const cachedData = this.rosterCache.get(teamId);
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
  
    if (cachedData && Date.now() - cachedData.timestamp < cacheExpiry) {
      return cachedData.data;
    }
  
    return this.cacheTeamRoster(teamId);
  }
  
  // Helper method to process player stats (uses existing getPlayerSeasonStats)
  async enrichPlayerStats(playerId) {
    const seasonStats = await this.getPlayerSeasonStats(playerId);
    
    if (!seasonStats) return null;
  
    return {
      batting: {
        avg: seasonStats.batting?.avg || '.000',
        homeRuns: seasonStats.batting?.homeRuns || 0,
        rbi: seasonStats.batting?.rbi || 0,
        ops: seasonStats.batting?.ops || '.000',
        stolenBases: seasonStats.batting?.stolenBases || 0,
        hits: seasonStats.batting?.hits || 0,
        atBats: seasonStats.batting?.atBats || 0
      },
      pitching: {
        era: seasonStats.pitching?.era || '0.00',
        wins: seasonStats.pitching?.wins || 0,
        losses: seasonStats.pitching?.losses || 0,
        strikeouts: seasonStats.pitching?.strikeouts || 0,
        whip: seasonStats.pitching?.whip || '0.00',
        inningsPitched: seasonStats.pitching?.inningsPitched || '0.0',
        record: `${seasonStats.pitching?.wins || 0}-${seasonStats.pitching?.losses || 0}`
      }
    };
  }

  async getHeadToHeadRecord(awayTeamId, homeTeamId, cutoffDateTime) {
    console.log("Away team id: ", awayTeamId);
    console.log("Home team id: ", homeTeamId);
    try {
      // 1) Construct the schedule endpoint to cover 2 seasons (2023-01-01 to 2024-12-31)
      //    You can adjust these dates if you need a different window.
      const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?` +
        `sportId=1` +
        `&teamId=${homeTeamId}` + 
        `&opponentId=${awayTeamId}` +
        `&startDate=2024-01-01` +
        `&endDate=2024-12-31` +
        `&gameTypes=R` +        // Regular-season games only
        `&expand=schedule.teams` +
        `&expand=schedule.linescore`;
      
      const schedulePrevUrl = `https://statsapi.mlb.com/api/v1/schedule?` +
        `sportId=1` +
        `&teamId=${homeTeamId}` + 
        `&opponentId=${awayTeamId}` +
        `&startDate=2023-01-01` +
        `&endDate=2023-12-31` +
        `&gameTypes=R` +        // Regular-season games only
        `&expand=schedule.teams` +
        `&expand=schedule.linescore`;
  
      // 2) Fetch the schedule data
      const response = await fetch(scheduleUrl);
      const scheduleData = await response.json();

      const prevResponse = await fetch(schedulePrevUrl);
      const prevScheduleData = await prevResponse.json();
  
      // 3) Flatten out all games from the returned 'dates'
      const firstAllGames = (scheduleData.dates ?? []).flatMap(date => date.games ?? []);
      const secondAllGames = (prevScheduleData.dates ?? []).flatMap(date => date.games ?? []);

      const allGames = [...firstAllGames, ...secondAllGames];

      console.log("All games: ", allGames);

      let homeTeamName = "";
      let awayTeamName = "";
      for (const game of allGames) {
        const homeTeam = game.teams?.home?.team;
        const awayTeam = game.teams?.away?.team;

        // If we find a match for homeTeamId, store its name
        if (homeTeam?.id === homeTeamId) {
          homeTeamName = homeTeam.name;
        }
        // If we find a match for awayTeamId, store its name
        if (awayTeam?.id === awayTeamId) {
          awayTeamName = awayTeam.name;
        }
        
        // If both names found, break early
        if (homeTeamName && awayTeamName) {
          break;
        }
      }
  
      // 4) Ensure cutoffDateTime is a Date object
      const cutoffDate = typeof cutoffDateTime === "string"
        ? new Date(cutoffDateTime)
        : cutoffDateTime;
  
      // 5) Filter out:
      //    - Games on or after cutoffDate
      //    - Games missing a valid score
      const validGames = allGames.filter(game => {
        const gameDate = new Date(game.gameDate);
        if (gameDate >= cutoffDate) return false;
  
        const homeScore = game.teams?.home?.score;
        const awayScore = game.teams?.away?.score;
  
        // Skip if the game is missing scores (e.g., not started or postponed)
        if (typeof homeScore !== "number" || typeof awayScore !== "number") {
          return false;
        }
        return true;
      });

      console.log("Valid Games: ", validGames);
  
      // 6) Sort valid games by gameDate descending (newest first)
      validGames.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
  
      // 7) Take the most recent 5 completed games from that list
      const lastFive = validGames.slice(0, 5);
  
      // 8) Tally wins/losses *within those 5*
      let homeWins = 0;
      let awayWins = 0;
      let tie = 0;
  
      for (const game of lastFive) {
        const { home, away } = game.teams;
        if (home.score > away.score) {
          homeWins++;
        } else if (away.score > home.score) {
          awayWins++;
        } else {
          tie++;
        }
        // If home.score === away.score, you could track a tie if needed (rare in MLB)
      }
  
      // 9) Build the lastFiveGames detail
      const lastFiveGames = lastFive.map(game => {
        const { home, away } = game.teams;
        return {
          date: new Date(game.gameDate).toLocaleDateString(),
          homeTeam: {
            name: home?.team?.name,
            score: home?.score
          },
          awayTeam: {
            name: away?.team?.name,
            score: away?.score
          },
          winner:
            home.score > away.score
              ? "home"
              : home.score < away.score
              ? "away"
              : "tie",
          status: game.status?.detailedState
        };
      });
  
      // 10) Return the record and details for these last 5
      return {
        awayTeamId,
        homeTeamId,
        homeTeamName,
        awayTeamName,
        home: homeWins,
        away: awayWins,
        ties: tie,
        lastFiveGames
      };
    } catch (error) {
      console.error("Error fetching head-to-head:", error);
      return {
        home: 0,
        away: 0,
        lastFiveGames: []
      };
    }
  }
  
  
  
}

export default MLBDataService;