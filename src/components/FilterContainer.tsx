interface FilterContainerProps {
  categories: string[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterContainer = ({ categories, currentFilter, onFilterChange }: FilterContainerProps) => {
  return (
    <div className="filter-container">
      {categories.map((category) => (
        <button
          key={category}
          className={`filter-button ${category === currentFilter ? 'active' : ''}`}
          onClick={() => onFilterChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default FilterContainer;