import { useAuth } from '../contexts/AuthContext';
import { FaHeart } from 'react-icons/fa';

interface FavoritesFilterProps {
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

const FavoritesFilter = ({ showFavorites, onToggleFavorites }: FavoritesFilterProps) => {
  const { user } = useAuth();

  if (!user) {
    return null; // Don't show favorites filter for non-logged in users
  }

  return (
    <button
      className={`favorites-filter-button ${showFavorites ? 'active' : ''}`}
      onClick={onToggleFavorites}
      aria-label={showFavorites ? 'Show all templates' : 'Show favorites only'}
    >
      <FaHeart size={16} />
      <span>{showFavorites ? 'All Templates' : 'My Favorites'}</span>
    </button>
  );
};

export default FavoritesFilter;