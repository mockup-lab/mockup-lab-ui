import { useRef, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdStars } from 'react-icons/md';
import { TemplateData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite, isTemplateFavorited } from '../services/favoriteService';

interface TemplateCardProps {
  template: TemplateData;
  positionClass: string;
  isFadingOut: boolean;
  onClick: () => void;
  isActive: boolean;
}

const TemplateCard = ({
  template,
  positionClass,
  isFadingOut,
  onClick,
  isActive,
}: TemplateCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, userProfile } = useAuth();

  // Check if template is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && userProfile && template.id) {
        try {
          const favorited = await isTemplateFavorited(user.uid, template.id);
          setIsFavorite(favorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [user, userProfile, template.id]);

  // Handle tilt effect on mouse move
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !cardInnerRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxTilt = 6;

    const rotateY = (x / (rect.width / 2)) * maxTilt;
    const rotateX = (-y / (rect.height / 2)) * maxTilt;

    cardInnerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  // Reset tilt on mouse leave
  const resetTilt = () => {
    if (cardInnerRef.current) {
      cardInnerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://placehold.co/400x350/cccccc/ffffff?text=Image+Error`;
    setIsLoaded(true);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!user || !template.id) return;

    try {
      const newFavoriteStatus = await toggleFavorite(user.uid, template.id);
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Apply initial styles
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transformStyle = 'preserve-3d';
      cardRef.current.style.backfaceVisibility = 'hidden';
      (cardRef.current.style as any).WebkitBackfaceVisibility = 'hidden'; // Add webkit prefix
      cardRef.current.style.willChange = 'transform, opacity';
    }

    if (cardInnerRef.current) {
      cardInnerRef.current.style.transformStyle = 'preserve-3d';
      cardInnerRef.current.style.backfaceVisibility = 'hidden';
      (cardInnerRef.current.style as any).WebkitBackfaceVisibility = 'hidden'; // Add webkit prefix
    }
  }, []);

  // Clean up any styles on unmount
  useEffect(() => {
    return () => {
      if (cardInnerRef.current) {
        cardInnerRef.current.style.transform = '';
      }
    };
  }, []);

  // Force a reflow when position class changes to ensure animations work
  useEffect(() => {
    if (cardRef.current) {
      // Force a reflow
      void cardRef.current.offsetHeight;
    }
  }, [positionClass, isFadingOut]);

  return (
    <div
      ref={cardRef}
      className={`card ${positionClass} ${isFadingOut ? 'fade-out' : 'fade-in'}`}
      onClick={onClick}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
      data-index={template.index}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform, opacity',
        opacity: isLoaded ? undefined : 0, // Hide until image is loaded
        transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        pointerEvents: isActive ? 'auto' : 'none' // Only allow interaction with active card
      }}
    >
      <div
        ref={cardInnerRef}
        className="card-inner"
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <img
          src={template.image}
          alt={`${template.title} Preview`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />

        {/* Premium badge */}
        {template.isPremium && (
          <div className="premium-badge">
            <MdStars size={16} />
            <span>Premium</span>
          </div>
        )}

        {/* Favorite button */}
        {user && isActive && (
          <button
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
          </button>
        )}

        <div className="card-content">
          <div>
            <h3 className="card-title">{template.title}</h3>
            <p className="card-description">{template.description}</p>
          </div>
          <div className="card-tags">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="card-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;