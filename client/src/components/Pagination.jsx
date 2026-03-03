import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, onPageChange, hasNext, hasPrev }) {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12" data-testid="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
        data-testid="pagination-prev-btn"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
            data-testid="pagination-page-1"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-500 dark:text-gray-400">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg border transition ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          data-testid={`pagination-page-${page}`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500 dark:text-gray-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
            data-testid={`pagination-page-${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next page"
        data-testid="pagination-next-btn"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
}

export default Pagination;
