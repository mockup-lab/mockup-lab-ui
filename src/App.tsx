import { useState, useEffect, useRef, useCallback } from 'react';
import { TemplateDeckHandle } from './components/TemplateDeck';
import StarfieldCanvas from './components/StarfieldCanvas';
import SearchBar from './components/SearchBar';
import FilterContainer from './components/FilterContainer';
import TemplateDeck from './components/TemplateDeck';
import TemplateModal from './components/TemplateModal';
import DebugPanel from './components/DebugPanel';
import { TemplateData } from './types';

// Template data
const allTemplateData: TemplateData[] = [
  {
    index: 0,
    category: "Portfolio",
    title: "Modern Portfolio",
    description: "Sleek design for creatives.",
    longDescription: "This template features a clean layout with smooth animations...",
    image: "https://placehold.co/400x350/7c3aed/ffffff?text=Portfolio",
    tags: ["Portfolio", "Creative", "Minimal", "Responsive", "Design"]
  },
  {
    index: 1,
    category: "E-commerce",
    title: "E-commerce Pro",
    description: "Feature-rich online store.",
    longDescription: "Boost your online sales with E-commerce Pro...",
    image: "https://placehold.co/400x350/db2777/ffffff?text=E-commerce",
    tags: ["E-commerce", "Store", "Business", "React", "Shopify"]
  },
  {
    index: 2,
    category: "Blog",
    title: "Minimal Blog",
    description: "Content-focused layout.",
    longDescription: "Put your content front and center...",
    image: "https://placehold.co/400x350/16a34a/ffffff?text=Blog",
    tags: ["Blog", "Minimal", "Content", "SEO", "Writing"]
  },
  {
    index: 3,
    category: "Landing Page",
    title: "SaaS Landing Page",
    description: "Convert visitors effectively.",
    longDescription: "High-converting landing page template...",
    image: "https://placehold.co/400x350/ca8a04/ffffff?text=SaaS+Landing",
    tags: ["SaaS", "Landing Page", "Startup", "Lead Gen", "Software"]
  },
  {
    index: 4,
    category: "Portfolio",
    title: "Agency Showcase",
    description: "Professional look for agencies.",
    longDescription: "Showcase your agency's services...",
    image: "https://placehold.co/400x350/0ea5e9/ffffff?text=Agency",
    tags: ["Agency", "Business", "Portfolio", "Corporate", "Services"]
  },
  {
    index: 5,
    category: "Blog",
    title: "Travel Blog",
    description: "Share your adventures visually.",
    longDescription: "A visually rich blog template perfect for travel writers...",
    image: "https://placehold.co/400x350/0d9488/ffffff?text=Travel+Blog",
    tags: ["Blog", "Travel", "Photography", "Content", "Adventure"]
  },
  {
    index: 6,
    category: "E-commerce",
    title: "Craft Store",
    description: "Charming store for artisans.",
    longDescription: "A friendly and warm e-commerce template ideal for selling handmade goods...",
    image: "https://placehold.co/400x350/c026d3/ffffff?text=Craft+Store",
    tags: ["E-commerce", "Handmade", "Artisan", "Store", "Crafts"]
  }
];

function App() {
  // State
  const [currentTemplateData, setCurrentTemplateData] = useState<TemplateData[]>([...allTemplateData]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnimatingFilter, setIsAnimatingFilter] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Refs
  const debounceTimerRef = useRef<number | null>(null);
  const deckRef = useRef<TemplateDeckHandle>(null);

  // Filter and search logic
  const applyFiltersAndSearch = useCallback(() => {
    if (isAnimatingFilter) return;

    console.log('Starting filter animation, isNavigating:', deckRef.current?.isNavigating);
    setIsAnimatingFilter(true);

    // Use setTimeout to allow for animation
    setTimeout(() => {
      let filteredByCategory = (currentFilter === 'All')
        ? [...allTemplateData]
        : allTemplateData.filter(item => item.category === currentFilter);

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

      // Only reset activeIndex if not animating and not navigating and there are templates
      // Use setTimeout to ensure we get the latest ref value
      const isCurrentlyNavigating = setTimeout(() => deckRef.current?.isNavigating, 0);
      console.log('Applying filters, isCurrentlyNavigating:', isCurrentlyNavigating);
      const shouldReset = !isAnimatingFilter && !isCurrentlyNavigating && currentTemplateData.length > 0;
      console.log('Applying filters, should reset activeIndex:', shouldReset);
      if (shouldReset) {
        setActiveIndex(0);
      }
      setIsAnimatingFilter(false);
    }, 300);
  }, [currentFilter, searchTerm, isAnimatingFilter]);

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
  }, []);


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

  // Apply filters when filter or search changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [currentFilter, applyFiltersAndSearch]);

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

      <div className="brand-logo">mockuplab.in</div>

      <SearchBar
        value={searchTerm}
        onChange={handleSearchInput}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />

      <FilterContainer
        categories={['All', ...Array.from(new Set(allTemplateData.map(item => item.category)))]}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />

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

      <DebugPanel
        templates={currentTemplateData}
        activeIndex={activeIndex}
        isAnimatingFilter={isAnimatingFilter}
      />
    </>
  );
}

export default App;
