import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { TemplateDeckHandle } from './components/TemplateDeck';
import AdminDashboard from './components/admin/AdminDashboard';
import StarfieldCanvas from './components/StarfieldCanvas';
import SearchBar from './components/SearchBar';
import FilterContainer from './components/FilterContainer';
import TemplateDeck from './components/TemplateDeck';
import TemplateModal from './components/TemplateModal';
import UserMenu from './components/auth/UserMenu';
import TermsAndConditions from './components/TermsAndConditions';
import Logo from './components/Logo';
import CancellationAndRefund from './components/CancellationAndRefund';
import ShippingAndDelivery from './components/ShippingAndDelivery';
import PrivacyPolicy from './components/PrivacyPolicy';
import ContactUs from './components/ContactUs';
import { TemplateData } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getFavoriteTemplates } from './services/templateService';

import { getAllTemplates } from './services/templateService';

// Main App component wrapped with AuthProvider

// Main App component wrapped with AuthProvider
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Admin route wrapper
const AdminRoute = () => {
  const { user, userProfile } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userProfile === undefined || userProfile === null) {
    // Profile still loading
    return <div>Loading...</div>;
  }

  if (userProfile.isAdmin) {
    return <AdminDashboard />;
  }

  return <Navigate to="/" replace />;
};

// Main App content
const AppContent = () => {
  // Auth context
  const { user, userProfile } = useAuth();

  // State
  const [allTemplateData, setAllTemplateData] = useState<TemplateData[]>([]);
  const [currentTemplateData, setCurrentTemplateData] = useState<TemplateData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnimatingFilter, setIsAnimatingFilter] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [favoriteTemplates, setFavoriteTemplates] = useState<TemplateData[]>([]);

  // Refs
  const debounceTimerRef = useRef<number | null>(null);
  const deckRef = useRef<TemplateDeckHandle>(null);

  // Load user's favorite templates when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (user && userProfile) {
        try {
          const favorites = await getFavoriteTemplates(user.uid);
          setFavoriteTemplates(favorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      } else {
        setFavoriteTemplates([]);
      }
    };

    loadFavorites();
  }, [user, userProfile]);

  // Fetch templates from Firestore on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      setTemplateError(null);
      try {
        const templates = await getAllTemplates();
        setAllTemplateData(templates);
        setCurrentTemplateData(templates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplateError('Failed to load templates.');
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);


  // Filter and search logic
  const applyFiltersAndSearch = useCallback(() => {
    if (isAnimatingFilter) return;

    setIsAnimatingFilter(true);

    // Use setTimeout to allow for animation
    setTimeout(() => {
      // Start with all templates
      let baseTemplates: TemplateData[] = [];

      if (currentFilter === 'My Favorites') {
        baseTemplates = [...favoriteTemplates];
      } else {
        baseTemplates = [...allTemplateData];
      }

      // Apply category filter
      let filteredByCategory = (currentFilter === 'All')
        ? baseTemplates
        : baseTemplates.filter(item => item.category === currentFilter);

      // Apply search filter
      const lowerSearchTerm = searchTerm.toLowerCase().trim();

      if (lowerSearchTerm) {
        const filtered = filteredByCategory.filter(item => (
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          item.description.toLowerCase().includes(lowerSearchTerm) ||
          item.longDescription?.toLowerCase().includes(lowerSearchTerm) ||
          item.category.toLowerCase().includes(lowerSearchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        ));
        setCurrentTemplateData(filtered);
      } else {
        setCurrentTemplateData(filteredByCategory);
      }

      // Reset active index if needed
      const isCurrentlyNavigating = deckRef.current?.isNavigating;
      const shouldReset = !isAnimatingFilter && !isCurrentlyNavigating && currentTemplateData.length > 0;
      if (shouldReset) {
        setActiveIndex(0);
      }
      setIsAnimatingFilter(false);
    }, 300);
  }, [currentFilter, searchTerm, isAnimatingFilter, favoriteTemplates, allTemplateData]);

  // Handle filter change
  const handleFilterChange = useCallback((filter: string) => {
    if (filter === currentFilter || isAnimatingFilter) return;
    setCurrentFilter(filter);
  }, [currentFilter, isAnimatingFilter]);

  // Handle search input
  const handleSearchInput = useCallback((value: string) => {
    setSearchTerm(value);

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Set a new debounce timer
    debounceTimerRef.current = window.setTimeout(() => {
      applyFiltersAndSearch();
    }, 350);
  }, [applyFiltersAndSearch]);

  // Handle card click
  const handleCardClick = useCallback((templateIndex: number) => {
    const template = allTemplateData.find(item => item.index === templateIndex);
    if (template) {
      setSelectedTemplate(template);
      setModalVisible(true);
    }
  }, [allTemplateData]);

  // Handle navigation with arrow keys
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if modal is open or search is focused
    if (modalVisible || isSearchFocused) return;

    // Skip if there are no templates
    if (currentTemplateData.length === 0) return;

    // Delegate to the TemplateDeck component's handlers
    if (deckRef.current) {
      switch (e.key) {
        case 'ArrowLeft':
          if (deckRef.current.handlePrev) {
            deckRef.current.handlePrev();
            e.preventDefault();
          }
          break;
        case 'ArrowRight':
          if (deckRef.current.handleNext) {
            deckRef.current.handleNext();
            e.preventDefault();
          }
          break;
        case 'Enter':
          if (currentTemplateData[activeIndex] && deckRef.current.handleCardClick) {
            deckRef.current.handleCardClick(currentTemplateData[activeIndex].index);
            e.preventDefault();
          }
          break;
        default:
          break;
      }
    }
  }, [activeIndex, currentTemplateData, modalVisible, isSearchFocused]);

  // Set up global keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Apply filters when filter, search, or favorites changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [currentFilter, favoriteTemplates]); // Trigger when these change

  // Clean up any timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <StarfieldCanvas />

      <div className="header">
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo style={{ width: 40, height: 40, marginRight: 8 }} />
          mockuplab.in
        </Link>
        <div className="mt-2">
          <UserMenu />
        </div>
      </div>

      <Routes>
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/cancellation" element={<CancellationAndRefund />} />
        <Route path="/shipping" element={<ShippingAndDelivery />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="*"
          element={
            <>
              {loadingTemplates ? (
                <div className="loading-message">Loading templates...</div>
              ) : templateError ? (
                <div className="error-message">{templateError}</div>
              ) : (
                <>
                  <div className="search-and-filters">
                    <SearchBar
                      value={searchTerm}
                      onChange={handleSearchInput}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    />

                    <div className="filters-row">
                      <FilterContainer
                        categories={[
                          'All',
                          'My Favorites',
                          ...Array.from(new Set(allTemplateData.map(item => item.category)))
                        ]}
                        currentFilter={currentFilter}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  </div>

                  <TemplateDeck
                    ref={deckRef}
                    templates={currentTemplateData}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    isAnimatingFilter={isAnimatingFilter}
                    onCardClick={handleCardClick}
                  />

                  {selectedTemplate && (
                    <TemplateModal
                      isVisible={modalVisible}
                      template={selectedTemplate}
                      onClose={() => setModalVisible(false)}
                    />
                  )}
                </>
              )}
            </>
          }
        />
      </Routes>
      <footer className="fixed bottom-0 right-0 m-2 flex items-center space-x-1 text-xs text-gray-400 px-3 py-1 rounded">
        <Link to="/" title="Home" className="hover:underline flex items-center space-x-1">
          <i className="fas fa-home"></i><span>Home</span>
        </Link>
        <span className="mx-1 px-2"> | </span>

        <Link to="/shipping" title="Shipping and Delivery" className="hover:underline flex items-center space-x-1">
          <i className="fas fa-truck"></i><span>Shipping</span>
        </Link>
        <span className="mx-1 px-2"> | </span>

        <Link to="/cancellation" title="Cancellation and Refund" className="hover:underline flex items-center space-x-1">
          <i className="fas fa-ban"></i><span>Cancel</span>
        </Link>
        <span className="mx-1 px-2"> | </span>

        <Link to="/privacy" title="Privacy Policy" className="hover:underline flex items-center space-x-1">
          <i className="fas fa-user-secret"></i><span>Privacy</span>
        </Link>
        <span className="mx-1 px-2"> | </span>

        <Link to="/contact" title="Contact Us" className="hover:underline flex items-center space-x-1">
          <i className="fas fa-envelope"></i><span>Contact</span>
        </Link>
        <span className="mx-1 px-2"> | </span>

        <a href="/terms" title="Terms and Conditions" className="hover:underline flex items-center space-x-1">
          <i className="fas fa-file-contract"></i><span>Terms</span>
        </a>
      </footer>
    </>
  );
};

export default AppWithAuth;
