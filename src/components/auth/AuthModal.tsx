import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
}

enum AuthMode {
  LOGIN = 'login',
  SIGNUP = 'signup',
}

const AuthModal = ({ isVisible, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const { signInWithGoogle, signInAnonymously, error } = useAuth();

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

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  // Handle anonymous sign in
  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
      onClose();
    } catch (error) {
      console.error('Anonymous sign in error:', error);
    }
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content auth-modal">
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
        
        <h2 className="modal-title">
          {mode === AuthMode.LOGIN ? 'Log In to MockupLab' : 'Create an Account'}
        </h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <div className="auth-options">
          <button className="auth-button google" onClick={handleGoogleSignIn}>
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>
          
          <button className="auth-button anonymous" onClick={handleAnonymousSignIn}>
            <span>Continue as Guest</span>
          </button>
          
          <div className="auth-divider">
            <span>or</span>
          </div>
          
          {mode === AuthMode.LOGIN ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <SignupForm onSuccess={onClose} />
          )}
        </div>
        
        <div className="auth-footer">
          {mode === AuthMode.LOGIN ? (
            <p>
              Don't have an account?{' '}
              <button className="auth-link" onClick={() => setMode(AuthMode.SIGNUP)}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button className="auth-link" onClick={() => setMode(AuthMode.LOGIN)}>
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;