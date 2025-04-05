import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TemplateData } from '../types';
import TemplateCard from './TemplateCard';

interface TemplateDeckProps {
  templates: TemplateData[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isAnimatingFilter: boolean;
  onCardClick: (templateIndex: number) => void;
}

const TemplateDeck = ({
  templates,
  activeIndex,
  setActiveIndex,
  isAnimatingFilter,
  onCardClick,
}: TemplateDeckProps) => {
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

  const handlePrev = useCallback(() => {
    if (templates.length === 0) return;

    // Allow navigation even during animations for better responsiveness
    // Just store the click and process it after animation completes
    if (isAnimatingFilter || isFadingOut) {
      // Schedule the navigation after animation completes
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + templates.length) % templates.length);
      }, 300);
      return;
    }

    // Normal navigation when not animating
    setActiveIndex((activeIndex - 1 + templates.length) % templates.length);
  }, [templates, activeIndex, isAnimatingFilter, isFadingOut, setActiveIndex]);

  const handleNext = useCallback(() => {
    if (templates.length === 0) return;

    // Allow navigation even during animations for better responsiveness
    if (isAnimatingFilter || isFadingOut) {
      // Schedule the navigation after animation completes
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % templates.length);
      }, 300);
      return;
    }

    // Normal navigation when not animating
    setActiveIndex((activeIndex + 1) % templates.length);
  }, [templates, activeIndex, isAnimatingFilter, isFadingOut, setActiveIndex]);

  const handleCardClick = (templateIndex: number) => {
    // Allow clicks even during animations for better responsiveness
    // but delay the action until animation completes
    if (isAnimatingFilter || isFadingOut) {
      setTimeout(() => {
        const currentIndexInFiltered = templates.findIndex(item => item.index === templateIndex);

        if (currentIndexInFiltered === activeIndex) {
          onCardClick(templateIndex);
        } else if (currentIndexInFiltered !== -1) {
          setActiveIndex(currentIndexInFiltered);
        }
      }, 300);
      return;
    }

    // Normal behavior when not animating
    const currentIndexInFiltered = templates.findIndex(item => item.index === templateIndex);

    if (currentIndexInFiltered === activeIndex) {
      onCardClick(templateIndex);
    } else if (currentIndexInFiltered !== -1) {
      setActiveIndex(currentIndexInFiltered);
    }
  };

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
    if (!isSwipingRef.current) return;

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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Always check if we can navigate, regardless of focus state
    // This makes keyboard navigation more reliable

    switch (e.key) {
      case 'ArrowLeft':
        handlePrev();
        e.preventDefault();
        break;
      case 'ArrowRight':
        handleNext();
        e.preventDefault();
        break;
      default:
        break;
    }
  }, [handlePrev, handleNext]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Apply filter animation
  useEffect(() => {
    if (isAnimatingFilter) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsFadingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimatingFilter]);

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
      className="deck-container"
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
        outline: 'none' // Remove focus outline
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
};

export default TemplateDeck;