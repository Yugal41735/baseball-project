import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: '.game-feed',
    title: 'Live Game Feed',
    content: 'Watch the game unfold with live updates or historical playback.',
    position: 'bottom'
  },
  {
    target: '.personality-modes',
    title: 'Customize Your Experience',
    content: 'Choose how baseball is explained—Casual, Stats Nerd, or History Buff!',
    position: 'left'
  },
  {
    target: '.ai-commentary',
    title: 'AI Commentary',
    content: 'Real-time insights and commentary about the game as it happens.',
    position: 'left'
  },
  {
    target: '.baseball-expert',
    title: 'Ask the Expert',
    content: 'Have questions? Our AI Baseball Expert is here to help!',
    position: 'left'
  },
  {
    target: '.field-view',
    title: 'Interactive Field View',
    content: 'See live base runners and field positions updated in real time.',
    position: 'top'
  }
];

const TOOLTIP_WIDTH = 320;

const GuidedTour = ({ isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);

  // 1) When step changes (or isVisible toggles), we:
  //    a) Scroll to the element
  //    b) After a short delay, measure again
  useEffect(() => {
    if (isVisible && TOUR_STEPS[currentStep]) {
      // Step a) Scroll to the element immediately
      const element = document.querySelector(TOUR_STEPS[currentStep].target);
      if (!element) {
        setTargetElement(null);
        return;
      }
      scrollToElement(element);

      // Step b) Wait ~400ms so scroll & layout settle, then measure
      const measureTimer = setTimeout(() => {
        const updatedElement = document.querySelector(
          TOUR_STEPS[currentStep].target
        );
        if (updatedElement) {
          setTargetElement(updatedElement);
        }
      }, 400);

      return () => clearTimeout(measureTimer);
    }
  }, [isVisible, currentStep]);

  // 2) Lock body scroll *after* we’ve done our initial measurement
  //    This helps avoid partial/invisible tooltip if the element is off-screen.
  useEffect(() => {
    if (isVisible) {
      // Slight delay so scroll can happen
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

  const scrollToElement = (element) => {
    const rect = element.getBoundingClientRect();
    const offset = 100; // so we scroll slightly above it
    const scrollPos = window.scrollY + rect.top - offset;
    window.scrollTo({
      top: scrollPos < 0 ? 0 : scrollPos,
      behavior: 'smooth'
    });
  };

  const getPositionStyles = () => {
    if (!targetElement) return {};
    const step = TOUR_STEPS[currentStep];
    const rect = targetElement.getBoundingClientRect();

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let top = 0;
    let left = 0;
    
    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case 'top':
        top = rect.top - 180; // approx tooltip height
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
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
    }

    // Keep tooltip in viewport if possible
    if (left < 20) left = 20;
    if (left + TOOLTIP_WIDTH > windowWidth - 20) {
      left = windowWidth - TOOLTIP_WIDTH - 20;
    }
    if (top < 20) top = 20;
    if (top > windowHeight - 180) top = windowHeight - 180;

    // Add the current page scroll offsets
    return {
      top: `${top + window.scrollY}px`,
      left: `${left + window.scrollX}px`
    };
  };

  const stepLabel = `Step ${currentStep + 1} of ${TOUR_STEPS.length}`;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay behind everything */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" />

      {targetElement && (
        <>
          {/* Spotlight effect (large box shadow) */}
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
              {/* Step indicator */}
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded absolute -top-6 left-0">
                {stepLabel}
              </span>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Title & Content */}
            <h3 className="font-bold text-lg mb-2">{TOUR_STEPS[currentStep].title}</h3>
            <p className="text-gray-600 mb-4">{TOUR_STEPS[currentStep].content}</p>

            {/* Navigation */}
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
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
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
