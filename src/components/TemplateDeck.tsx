import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { TemplateData } from '../types';
import TemplateCard from './TemplateCard';

interface TemplateDeckProps {
  templates: TemplateData[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isAnimatingFilter: boolean;
  onCardClick: (templateIndex: number) => void;
}

// Define the ref interface
export interface TemplateDeckHandle {
  handlePrev: () => void;
  handleNext: () => void;
  handleCardClick: (templateIndex: number) => void;
  readonly isNavigating: boolean;
}

const TemplateDeck = forwardRef<TemplateDeckHandle, TemplateDeckProps>(({
  templates,
  activeIndex,
  setActiveIndex,
  isAnimatingFilter,
  onCardClick,
}, ref) => {
  const [isNavigatingInternal, setIsNavigatingInternal] = useState(false);
  
  const [isFadingOut, setIsFadingOut] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const isSwipingRef = useRef(false);
  const swipeThreshold = 50;
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Handle navigation
  useEffect(() => {
    if (isNavigatingInternal) {
      const timer = setTimeout(() => {
        setIsNavigatingInternal(false);
      }, 1000); // Increased timeout to ensure animations complete
      return () => clearTimeout(timer);
    }
  }, [isNavigatingInternal]);

  const navigateTo = useCallback((newIndex: number) => {
    if (templates.length === 0 || isNavigatingInternal) {
      return;
    }

    setIsNavigatingInternal(true);
    setActiveIndex(newIndex);

    // Force reflow for CSS transitions
    if (deckRef.current) {
      void deckRef.current.offsetHeight;
    }

    // Ensure ref updates before any parent checks
    setTimeout(() => {}, 0);
  }, [templates, isNavigatingInternal, setActiveIndex]);

  const handlePrev = useCallback(() => {
    const newIndex = (activeIndex - 1 + templates.length) % templates.length;
    navigateTo(newIndex);
  }, [activeIndex, templates, navigateTo]);

  const handleNext = useCallback(() => {
    const newIndex = (activeIndex + 1) % templates.length;
    navigateTo(newIndex);
  }, [activeIndex, templates, navigateTo]);

  const handleCardClick = useCallback((templateIndex: number) => {
    if (isNavigatingInternal) return;

    // Find the index of the clicked template in the filtered list
    const currentIndexInFiltered = templates.findIndex(item => item.index === templateIndex);

    // If clicking the active card, open the modal
    if (currentIndexInFiltered === activeIndex) {
      onCardClick(templateIndex);
      return;
    }

    // If clicking a different card, update the active index
    if (currentIndexInFiltered !== -1) {
      // Start navigation to clicked card
      navigateTo(currentIndexInFiltered);
    }
  }, [templates, activeIndex, onCardClick, isNavigatingInternal]);

  // Expose methods and state to parent component via ref
  useImperativeHandle(ref, () => ({
    handlePrev,
    handleNext,
    handleCardClick,
    get isNavigating() {
      return isNavigatingInternal;
    }
  }), [handlePrev, handleNext, handleCardClick, isNavigatingInternal]);

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target instanceof Element && e.target.closest('button')) return;

    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;

    touchEndXRef.current = e.touches[0].clientX;
    touchEndYRef.current = e.touches[0].clientY;

    const diffX = Math.abs(touchEndXRef.current - touchStartXRef.current);
    const diffY = Math.abs(touchEndYRef.current - touchStartYRef.current);

    if (diffX > diffY + 10) {
      // Horizontal swipe detected, prevent scrolling
      // e.preventDefault() is commented out as it can cause issues in React
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipingRef.current || isNavigatingInternal) return;

    isSwipingRef.current = false;
    const diffX = touchEndXRef.current - touchStartXRef.current;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
    touchEndXRef.current = 0;
    touchEndYRef.current = 0;
  };

  // Apply filter animation and handle navigation state
  useEffect(() => {
    if (isAnimatingFilter || isNavigatingInternal) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsFadingOut(false);
      }, 600); // Match the CSS transition duration (0.6s = 600ms)
      return () => clearTimeout(timer);
    }
  }, [isAnimatingFilter, isNavigatingInternal]);

  // Get card position class based on its index relative to active index
  const getCardPositionClass = (cardIndex: number) => {
    if (templates.length === 0) return 'hidden';

    const totalCards = templates.length;
    const diff = cardIndex - activeIndex;
    const position = (diff + totalCards) % totalCards;

    switch (position) {
      case 0:
        return 'active';
      case 1:
        return 'next';
      case 2:
        return 'next-hidden';
      case totalCards - 1:
        return 'prev';
      case totalCards - 2:
        return 'prev-hidden';
      default:
        return 'hidden';
    }
  };

  // Force a reflow to ensure CSS transitions work properly
  useEffect(() => {
    if (deckRef.current) {
      // Force a reflow
      void deckRef.current.offsetHeight;
    }
  }, [activeIndex, templates, isAnimatingFilter]);

  return (
    <div
      className={`deck-container ${isNavigatingInternal ? 'navigating' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setHasFocus(true)}
      onMouseLeave={() => setHasFocus(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      tabIndex={0} // Make the container focusable
      style={{
        perspective: '1500px',
        outline: 'none', // Remove focus outline
        pointerEvents: isNavigatingInternal ? 'none' : 'auto' // Prevent interactions during navigation
      }}
    >
      <div
        className="deck"
        ref={deckRef}
        style={{
          transformStyle: 'preserve-3d',
          visibility: isInitialized ? 'visible' : 'hidden'
        }}
      >
        <button
          className="nav-arrow left"
          onClick={handlePrev}
          aria-label="Previous template"
          style={{
            opacity: templates.length === 0 ? 0 : 1,
            pointerEvents: templates.length === 0 ? 'none' : 'auto',
            position: 'absolute',
            left: '-2.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          className="nav-arrow right"
          onClick={handleNext}
          aria-label="Next template"
          style={{
            opacity: templates.length === 0 ? 0 : 1,
            pointerEvents: templates.length === 0 ? 'none' : 'auto',
            position: 'absolute',
            right: '-2.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {templates.map((template, index) => (
          <TemplateCard
            key={template.index}
            template={template}
            positionClass={getCardPositionClass(index)}
            isFadingOut={isFadingOut}
            onClick={() => handleCardClick(template.index)}
            isActive={index === activeIndex}
          />
        ))}

        <p
          className="no-results-message"
          style={{ display: templates.length === 0 ? 'flex' : 'none' }}
        >
          No templates match your criteria.
        </p>
      </div>
    </div>
  );
});

export default TemplateDeck;
