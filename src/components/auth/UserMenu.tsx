import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

const UserMenu = () => {
  const { user, userProfile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Handle login/signup button click
  const handleAuthButtonClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="user-menu-container" ref={menuRef}>
      {user ? (
        <>
          <button 
            className="user-avatar-button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="User menu"
          >
            {userProfile?.photoURL ? (
              <img 
                src={userProfile.photoURL} 
                alt={userProfile.displayName || 'User'} 
                className="user-avatar" 
              />
            ) : (
              <div className="user-avatar-placeholder">
                {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
              </div>
            )}
          </button>
          
          {isMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="user-info">
                <p className="user-name">{userProfile?.displayName || 'Guest User'}</p>
                <p className="user-email">{userProfile?.email || 'Anonymous'}</p>
              </div>
              
              <div className="menu-divider"></div>
              
              <button className="menu-item" onClick={() => { setIsMenuOpen(false); }}>
                My Favorites
              </button>
              
              <button className="menu-item" onClick={() => { setIsMenuOpen(false); }}>
                My Purchases
              </button>
              
              <div className="menu-divider"></div>
              
              <button className="menu-item sign-out" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </>
      ) : (
        <button className="login-button" onClick={handleAuthButtonClick}>
          Log In
        </button>
      )}
      
      <AuthModal 
        isVisible={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default UserMenu;