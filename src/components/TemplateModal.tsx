import { useEffect } from 'react';
import { TemplateData } from '../types';

interface TemplateModalProps {
  isVisible: boolean;
  template: TemplateData;
  onClose: () => void;
}

const TemplateModal = ({ isVisible, template, onClose }: TemplateModalProps) => {
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

  return (
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
        
        <img
          className="modal-image"
          src={template.image.replace('350', '400')}
          alt={`${template.title} Large Preview`}
          onError={handleImageError}
        />
        
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
          <button className="modal-button primary">Live Preview</button>
          <button className="modal-button secondary">Download</button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;