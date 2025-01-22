import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
    {
      target: '.nav-selector',  // For the sidebar navigation
      title: 'Easy Navigation',
      content: 'Switch between Live Game, Analysis, and AI Companion views using these buttons.',
      position: 'right',
      view: 'game'
    },
    {
      target: '.game-controls',  // For the Games and Learn buttons
      title: 'Game Controls',
      content: 'Select different games or access the Learning Mode to understand baseball better.',
      position: 'right',
      view: 'game'
    },
    // Live Game View
    {
      target: '.game-feed',
      title: 'Live Game Feed',
      content: 'Watch the game unfold with real-time updates and controls for playback.',
      position: 'bottom',
      view: 'game'
    },
    {
      target: '.game-info',
      title: 'Current Game Status',
      content: 'See the current score, inning, and game situation at a glance.',
      position: 'right',
      view: 'game'
    },
    {
      target: '.field-view',
      title: 'Field View',
      content: 'View live base runners and field positions in real-time.',
      position: 'left',
      view: 'game'
    },
    // Analysis View
    {
        target: '[data-view="analysis"]', // Add this attribute to the Analysis tab button
        title: 'Detailed Analysis',
        content: "Now let's check out the detailed game analysis. Click here or I'll guide you.",
        position: 'right',
        view: 'analysis',
        isTransition: true
    },
    {
      target: '.pitch-display',
      title: 'Pitch Analysis',
      content: 'Track pitch locations, types, and outcomes with detailed visualizations.',
      position: 'right',
      view: 'analysis'
    },
    {
      target: '.analytics-panel',
      title: 'Game Analytics',
      content: 'Deep dive into game statistics, win probability, and team comparisons.',
      position: 'left',
      view: 'analysis'
    },
    {
        target: '[data-view="companion"]', // Add this attribute to the Companion tab button
        title: 'AI Features',
        content: "Finally, let's explore the AI companion features!",
        position: 'right',
        view: 'companion',
        isTransition: true
    },
    // AI Companion View
    {
      target: '.ai-commentary',
      title: 'Live Commentary',
      content: 'Get real-time AI commentary about the game as it happens.',
      position: 'left',
      view: 'companion'
    },
    {
      target: '.personality-modes',
      title: 'Commentary Style',
      content: 'Choose your preferred commentary style - from casual fan to stats expert.',
      position: 'left',
      view: 'companion'
    },
    {
      target: '.baseball-expert',
      title: 'Ask the Expert',
      content: 'Have questions? Chat with our AI Baseball Expert about anything in the game!',
      position: 'left',
      view: 'companion'
    }
  ];

const TOOLTIP_WIDTH = 320;



const GuidedTour = ({ isVisible, onClose, onViewChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);

  

  useEffect(() => {
    if (isVisible && TOUR_STEPS[currentStep]) {
      const step = TOUR_STEPS[currentStep];
      
      // Change view if needed
      if (step.view && onViewChange) {
        onViewChange(step.view);
      }

      // Add small delay for view transition before finding element
    //   setTimeout(() => {
    //     const element = document.querySelector(step.target);
    //     if (element) {
    //       setTargetElement(element);
    //       scrollToElement(element);
    //     }
    //   }, step.isTransition ? 300 : 0);
        const timer = setTimeout(() => {
            const element = document.querySelector(step.target);
            if (element) {
            const needsScroll = scrollToElement(element);
            
            // Add a delay to set target element if scrolling was needed
            if (needsScroll) {
                setTimeout(() => {
                setTargetElement(element);
                }, 500); // Wait for scroll to complete
            } else {
                setTargetElement(element);
            }
            }
        }, step.isTransition ? 300 : 0);
    
        return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, onViewChange]);

  // 1) On each step (or if isVisible changes), we:
  //    a) Try to scroll to the element
  //    b) Then measure after a delay
//   useEffect(() => {
//     if (isVisible && TOUR_STEPS[currentStep]) {
//       const element = document.querySelector(TOUR_STEPS[currentStep].target);
//       if (!element) {
//         setTargetElement(null);
//         return;
//       }
//       scrollToElement(element);

//       const measureTimer = setTimeout(() => {
//         const updatedElement = document.querySelector(TOUR_STEPS[currentStep].target);
//         if (updatedElement) {
//           setTargetElement(updatedElement);
//         }
//       }, 400);

//       return () => clearTimeout(measureTimer);
//     }
//   }, [isVisible, currentStep]);

  // 2) Lock body scroll after we measure
  useEffect(() => {
    if (isVisible) {
      const lockTimer = setTimeout(() => {
        document.body.style.overflow = 'hidden';
      }, 600);

      return () => {
        clearTimeout(lockTimer);
        document.body.style.overflow = '';
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

//   const scrollToElement = (element) => {
//     if (!element) return;
    
//     const rect = element.getBoundingClientRect();
//     const viewportHeight = window.innerHeight;
//     const elementHeight = rect.height;
//     const elementTop = rect.top;
//     const elementBottom = rect.bottom;
  
//     // Check if element is fully in view
//     const isInView = (
//       elementTop >= 0 &&
//       elementBottom <= viewportHeight
//     );
  
//     if (!isInView) {
//       // Calculate position to scroll to
//       // This will center the element in the viewport
//       const scrollPosition = window.pageYOffset + rect.top - (viewportHeight / 2) + (elementHeight / 2);
      
//       window.scrollTo({
//         top: scrollPosition,
//         behavior: 'smooth'
//       });
  
//       // Return true if scroll was needed
//       return true;
//     }
//     return false;
//   };

  const scrollToElement = (element) => {
    const rect = element.getBoundingClientRect();
    const offset = 100; // scroll offset from top
    const scrollPos = window.scrollY + rect.top - offset;
    window.scrollTo({
      top: scrollPos < 0 ? 0 : scrollPos,
      behavior: 'smooth'
    });
  };



  const step = TOUR_STEPS[currentStep];
  const stepLabel = `Step ${currentStep + 1} of ${TOUR_STEPS.length}`;

  const getPositionStyles = () => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let top;
    let left;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case 'top':
        top = rect.top - 180; // approx. tooltip height
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 100;
        left = rect.left - TOOLTIP_WIDTH - 20;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + 20;
        break;
      default:
        // fallback
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
    }

    // ensure tooltip is in viewport
    if (left < 20) left = 20;
    if (left + TOOLTIP_WIDTH > windowWidth - 20) {
      left = windowWidth - TOOLTIP_WIDTH - 20;
    }
    if (top < 20) top = 20;
    if (top > windowHeight - 180) {
      top = windowHeight - 180;
    }

    return {
      top: `${top + window.scrollY}px`,
      left: `${left + window.scrollX}px`
    };
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background dim */}
      <div className="absolute inset-0 bg-black bg-opacity-60 pointer-events-auto" />

      {targetElement && (
        <>
          {/* Spotlight */}
          <div
            className="absolute pointer-events-none transition-all duration-300 ease-in-out"
            style={{
              top: targetElement.getBoundingClientRect().top + window.scrollY - 8,
              left: targetElement.getBoundingClientRect().left + window.scrollX - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
              borderRadius: '8px'
            }}
          />

          {/* Highlight border */}
          <div
            className="absolute border-2 border-blue-500 rounded-lg pointer-events-none transition-all duration-300 ease-in-out"
            style={{
              top: targetElement.getBoundingClientRect().top + window.scrollY - 4,
              left: targetElement.getBoundingClientRect().left + window.scrollX - 4,
              width: targetElement.getBoundingClientRect().width + 8,
              height: targetElement.getBoundingClientRect().height + 8
            }}
          >
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse opacity-50" />
          </div>

          {/* Tooltip */}
          <div
            className="absolute bg-white w-80 rounded-xl shadow-xl pointer-events-auto z-50 p-4"
            style={getPositionStyles()}
          >
            <div className="relative mb-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded absolute -top-6 left-0">
                {stepLabel}
              </span>
              <button
                onClick={onClose}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-gray-600 mb-4">{step.content}</p>

            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                className={`flex items-center text-sm ${
                  currentStep === 0 ? 'invisible' : 'text-blue-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center text-sm text-blue-600 font-medium"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                {currentStep < TOUR_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GuidedTour;
