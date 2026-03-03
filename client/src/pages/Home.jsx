import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search } from 'lucide-react'
import NewsCard from '../components/NewsCard'
import Pagination from '../components/Pagination'
import TagFilter from '../components/TagFilter'
import { NewsCardSkeleton } from '../components/LoadingSkeleton'
import { newsApi } from '../lib/api'
import logo from '../assets/logo.jpg'

function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [allTags, setAllTags] = useState([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    fetchNews()
  }, [search, selectedTag, currentPage])

  const fetchTags = async () => {
    try {
      const response = await newsApi.getAllTags()
      setAllTags(response.data.tags)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await newsApi.getAll(search, selectedTag, currentPage, 12)
      setArticles(response.data.items)
      setTotalPages(response.data.total_pages)
      setHasNext(response.data.has_next)
      setHasPrev(response.data.has_prev)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setCurrentPage(1)
  }

  const handleTagSelect = (tag) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Helmet>
        <title>TheCloudMind.ai - Latest AI News & Insights</title>
        <meta name="description" content="Stay updated with the latest AI news, artificial intelligence developments, machine learning breakthroughs, and GenAI innovations. Your trusted source for AI insights and technology trends." />
        <meta name="keywords" content="AI news, artificial intelligence, machine learning, GenAI, AI insights, AI developments, technology news, AI innovations" />
        <meta property="og:title" content="TheCloudMind.ai - Latest AI News & Insights" />
        <meta property="og:description" content="Your trusted source for AI news, developments, and innovations from around the world." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cloudmindai.in/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TheCloudMind.ai - Latest AI News & Insights" />
        <meta name="twitter:description" content="Your trusted source for AI news, developments, and innovations from around the world." />
        <link rel="canonical" href="https://cloudmindai.in/" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
        {/* Logo Hero Section */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="TheCloudMind.ai"
            className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900 hover:ring-blue-200 dark:hover:ring-blue-800 transition-all"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-4">
          <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            TheCloudMind.ai
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 px-4">
          Latest AI News & Insights
        </p>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
          Your trusted source for AI developments and innovations
        </p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search news..."
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition text-sm sm:text-base"
              data-testid="search-input"
            />
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-3 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm sm:text-base"
              data-testid="search-btn"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Tag Filter */}
      <TagFilter 
        tags={allTags} 
        selectedTag={selectedTag} 
        onTagSelect={handleTagSelect} 
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-xl">No articles found</p>
          {(search || selectedTag) && (
            <button 
              onClick={() => { 
                setSearch(''); 
                setSearchInput(''); 
                setSelectedTag('');
                setCurrentPage(1);
              }}
              className="mt-4 text-blue-600 hover:underline"
              data-testid="clear-filters-btn"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasNext={hasNext}
              hasPrev={hasPrev}
            />
          )}
        </>
      )}
      </div>
    </>
  )
}

export default Home
