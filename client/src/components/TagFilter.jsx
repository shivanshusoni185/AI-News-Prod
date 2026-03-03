import { X } from 'lucide-react';

function TagFilter({ tags, selectedTag, onTagSelect }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-8" data-testid="tag-filter">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Tag:</h3>
      <div className="flex flex-wrap gap-2">
        {selectedTag && (
          <button
            onClick={() => onTagSelect('')}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center gap-1"
            data-testid="clear-tag-filter-btn"
          >
            <X className="w-3 h-3" />
            Clear Filter
          </button>
        )}
        {tags.slice(0, 15).map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            data-testid={`tag-filter-${tag.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagFilter;
