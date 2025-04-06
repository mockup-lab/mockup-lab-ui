import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';
import { MdStars } from 'react-icons/md';
import { TemplateData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite, isTemplateFavorited } from '../services/favoriteService';
import { hasUserPurchasedTemplate, recordTemplatePurchase } from '../services/templateService';
import AuthModal from './auth/AuthModal';

interface TemplateModalProps {
  isVisible: boolean;
  template: TemplateData;
  onClose: () => void;
}

const TemplateModal = ({ isVisible, template, onClose }: TemplateModalProps) => {
  const { user, userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Check if template is favorited and purchased
  useEffect(() => {
    const checkTemplateStatus = async () => {
      if (user && userProfile && template.id) {
        try {
          // Check favorite status
          const favorited = await isTemplateFavorited(user.uid, template.id);
          setIsFavorite(favorited);

          // Check purchase status if premium
          if (template.isPremium) {
            const purchased = await hasUserPurchasedTemplate(user.uid, template.id);
            setIsPurchased(purchased);
          }
        } catch (error) {
          console.error('Error checking template status:', error);
        }
      }
    };

    if (isVisible) {
      checkTemplateStatus();
    }
  }, [user, userProfile, template.id, template.isPremium, isVisible]);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, onClose]);

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Error';
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user || !template.id) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const newFavoriteStatus = await toggleFavorite(user.uid, template.id);
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle live preview
  const handleLivePreview = () => {
    if (template.demoUrl) {
      window.open(template.demoUrl, '_blank');
    }
  };

  // Handle download
  const handleDownload = () => {
    // For free templates or purchased premium templates
    if (!template.isPremium || isPurchased) {
      if (template.downloadUrl) {
        window.open(template.downloadUrl, '_blank');
      }
    } else {
      // For premium templates that haven't been purchased
      handlePurchase();
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!template.id || !template.isPremium) return;

    try {
      setIsProcessingPurchase(true);

      // TODO: Integrate with actual payment gateway
      // For now, just record the purchase
      await recordTemplatePurchase(user.uid, template.id);

      setIsPurchased(true);
      alert('Purchase successful! You now have access to download this template.');
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  // Determine button text based on template status
  const getDownloadButtonText = () => {
    if (template.isPremium) {
      if (isPurchased) {
        return 'Download';
      } else {
        return `Purchase ($${template.price?.toFixed(2) || '0.00'})`;
      }
    } else {
      return 'Download Free';
    }
  };

  return (
    <>
      <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOverlayClick}>
        <div className="modal-content">
          <button className="modal-close-btn" onClick={onClose}>
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="modal-header">
            <img
              className="modal-image"
              src={template.fullImageUrl || template.image.replace('350', '400')}
              alt={`${template.title} Large Preview`}
              onError={handleImageError}
            />

            <div className="modal-header-actions">
              <button
                className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
              </button>

              {template.isPremium && (
                <div className="premium-badge">
                  <MdStars size={18} />
                  <span>Premium Template</span>
                </div>
              )}
            </div>
          </div>

          <h2 className="modal-title">{template.title}</h2>

          <p className="modal-description">
            {template.longDescription || template.description}
          </p>

          <div className="modal-tags">
            {template.tags.map((tag, index) => (
              <span key={index} className="modal-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="modal-button primary"
              onClick={handleLivePreview}
              disabled={!template.demoUrl}
            >
              <FaExternalLinkAlt size={16} />
              <span>Live Preview</span>
            </button>

            <button
              className={`modal-button ${template.isPremium && !isPurchased ? 'premium' : 'secondary'}`}
              onClick={handleDownload}
              disabled={isProcessingPurchase || (!template.downloadUrl && !template.isPremium)}
            >
              {isProcessingPurchase ? (
                <span>Processing...</span>
              ) : (
                <>
                  <FaDownload size={16} />
                  <span>{getDownloadButtonText()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isVisible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default TemplateModal;