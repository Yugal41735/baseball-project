// import React, { useEffect } from 'react';
// import { useReward } from 'react-rewards';

// const VictoryAnimation = ({ colors, isVisible, onComplete }) => {
//   // Left corner confetti
//   const { reward: rewardLeftConfetti } = useReward('leftConfetti', 'confetti', {
//     elementCount: 100,
//     spread: 80,
//     lifetime: 1000,
//     colors: colors,
//     angle: 45, // Shooting towards right
//     decay: 0.94,
//     startVelocity: 35
//   });

//   // Right corner confetti
//   const { reward: rewardRightConfetti } = useReward('rightConfetti', 'confetti', {
//     elementCount: 100,
//     spread: 80,
//     lifetime: 1000,
//     colors: colors,
//     angle: 135, // Shooting towards left
//     decay: 0.94,
//     startVelocity: 35
//   });

//   // Center balloons
//   const { reward: rewardBalloons } = useReward('balloonReward', 'balloons', {
//     lifetime: 1000,
//     colors: colors,
//     spread: 360, // Full circle spread
//     startVelocity: 20,
//     elementCount: 20,
//     elementSize: 30
//   });

//   useEffect(() => {
//     if (isVisible) {
//       // Trigger confetti from both corners
//       rewardLeftConfetti();
//       rewardRightConfetti();
      
//       // Slight delay for balloons
//       setTimeout(() => {
//         rewardBalloons();
//       }, 200);

//       // End animation after 3 seconds
//       const timer = setTimeout(onComplete, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isVisible, rewardLeftConfetti, rewardRightConfetti, rewardBalloons, onComplete]);

//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 z-50">
//       {/* Left corner confetti */}
//       <div className="absolute bottom-0 left-0">
//         <span id="leftConfetti" />
//       </div>

//       {/* Right corner confetti */}
//       <div className="absolute bottom-0 right-0">
//         <span id="rightConfetti" />
//       </div>

//       {/* Center balloons */}
//       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//         <span id="balloonReward" />
//       </div>
//     </div>
//   );
// };

// export default VictoryAnimation;

// import React, { useEffect } from 'react';
// import { useReward } from 'react-rewards';

// const VictoryAnimation = ({ colors, isVisible, onComplete, gameType = 'R' }) => {
//   // Calculate intensity based on game type
//   const intensity = gameType === 'P' ? 1.5 : 1; // More particles for playoff games
  
//   // Left corner confetti with baseballs
//   const { reward: rewardLeftConfetti } = useReward('leftConfetti', 'confetti', {
//     elementCount: Math.floor(100 * intensity),
//     spread: 80,
//     lifetime: 1000,
//     colors: colors,
//     angle: 45,
//     decay: 0.94,
//     startVelocity: 35,
//     shapes: ['circle', '⚾'] // Mix baseballs with regular confetti
//   });

//   // Right corner confetti with baseballs
//   const { reward: rewardRightConfetti } = useReward('rightConfetti', 'confetti', {
//     elementCount: Math.floor(100 * intensity),
//     spread: 80,
//     lifetime: 1000,
//     colors: colors,
//     angle: 135,
//     decay: 0.94,
//     startVelocity: 35,
//     shapes: ['circle', '⚾']
//   });

//   // Center balloons
//   const { reward: rewardBalloons } = useReward('balloonReward', 'balloons', {
//     lifetime: 1000,
//     colors: colors,
//     spread: 360,
//     startVelocity: 20,
//     elementCount: Math.floor(20 * intensity),
//     elementSize: 30
//   });

//   useEffect(() => {
//     if (isVisible) {
//       // Start with confetti from corners
//       rewardLeftConfetti();
//       rewardRightConfetti();
      
//       // Add balloons after a slight delay
//       setTimeout(() => {
//         rewardBalloons();
//       }, 200);

//       // Sound effect (only if user has interacted with page)
//       if (gameType === 'P' && document.hasFocus()) {
//         try {
//           const audio = new Audio('/victory.mp3'); // You would need to add this sound file
//           audio.volume = 0.3; // Keep it subtle
//           audio.play().catch(() => {}); // Ignore errors if audio can't play
//         } catch (error) {
//           // Ignore audio errors
//         }
//       }

//       const timer = setTimeout(onComplete, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isVisible, rewardLeftConfetti, rewardRightConfetti, rewardBalloons, onComplete, gameType]);

//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 z-50">
//       {/* Spinning baseball background */}
//       <div className="absolute inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//           <div className="text-[200px] opacity-10 animate-spin-slow">⚾</div>
//         </div>
//       </div>

//       {/* Left corner confetti */}
//       <div className="absolute bottom-0 left-0">
//         <span id="leftConfetti" />
//       </div>

//       {/* Right corner confetti */}
//       <div className="absolute bottom-0 right-0">
//         <span id="rightConfetti" />
//       </div>

//       {/* Center balloons */}
//       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//         <span id="balloonReward" />
//       </div>
//     </div>
//   );
// };

// export default VictoryAnimation;

import React, { useEffect } from 'react';
import { useReward } from 'react-rewards';

const VictoryAnimation = ({ colors, isVisible, onComplete, gameType = 'R' }) => {
  // Regular confetti from corners
  const { reward: rewardLeftConfetti } = useReward('leftConfetti', 'confetti', {
    elementCount: 150,
    spread: 80,
    lifetime: 1000,
    colors: colors,
    angle: 45,
    decay: 0.94,
    startVelocity: 35
  });

  const { reward: rewardRightConfetti } = useReward('rightConfetti', 'confetti', {
    elementCount: 150,
    spread: 80,
    lifetime: 1000,
    colors: colors,
    angle: 135,
    decay: 0.94,
    startVelocity: 35
  });

  // Center flying baseballs
  const { reward: rewardBaseballs } = useReward('baseballReward', 'emoji', {
    lifetime: 1000,
    spread: 360,
    startVelocity: 20,
    elementCount: 10,
    emoji: ['⚾']
  });

  // Center balloons
  const { reward: rewardBalloons } = useReward('balloonReward', 'balloons', {
    lifetime: 1000,
    colors: colors,
    spread: 360,
    startVelocity: 20,
    elementCount: 20,
    elementSize: 30
  });

  useEffect(() => {
    if (isVisible) {
      // Start with confetti from corners
      rewardLeftConfetti();
      rewardRightConfetti();
      
      // Add baseballs and balloons slightly delayed
      setTimeout(() => {
        rewardBaseballs();
        rewardBalloons();
      }, 200);

      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, rewardLeftConfetti, rewardRightConfetti, rewardBaseballs, rewardBalloons, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Left corner confetti */}
      <div className="absolute bottom-0 left-0">
        <span id="leftConfetti" />
      </div>

      {/* Right corner confetti */}
      <div className="absolute bottom-0 right-0">
        <span id="rightConfetti" />
      </div>

      {/* Center elements */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span id="baseballReward" />
        <span id="balloonReward" />
      </div>
    </div>
  );
};

export default VictoryAnimation;