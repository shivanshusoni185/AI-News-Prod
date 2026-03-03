import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  ArrowLeft, Calendar, Tag, Clock, Eye, Heart, Bookmark, 
  Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check 
} from 'lucide-react'
import { newsApi, getImageUrl } from '../lib/api'
import { ArticleSkeleton } from '../components/LoadingSkeleton'
import NewsCard from '../components/NewsCard'

function Article() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [stats, setStats] = useState({ views: 0, likes: 0, bookmarks: 0 })
  const [readingProgress, setReadingProgress] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetchArticle()
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100
      setReadingProgress(Math.min(scrollPercentage, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const response = await newsApi.getBySlug(slug)
      setArticle(response.data)
      
      // Record view
      await newsApi.recordView(response.data.id)
      
      // Fetch stats and related articles
      const [statsRes, relatedRes] = await Promise.all([
        newsApi.getStats(response.data.id),
        newsApi.getRelated(response.data.id, 3)
      ])
      
      setStats(statsRes.data)
      setRelatedArticles(relatedRes.data)
    } catch (err) {
      setError('Article not found')
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (type) => {
    if (!article) return
    
    try {
      await newsApi.addReaction(article.id, type)
      
      if (type === 'like') {
        setLiked(!liked)
        setStats(prev => ({ ...prev, likes: liked ? prev.likes - 1 : prev.likes + 1 }))
      } else if (type === 'bookmark') {
        setBookmarked(!bookmarked)
        setStats(prev => ({ ...prev, bookmarks: bookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1 }))
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleShare = (platform) => {
    if (!article) return
    
    const url = `https://cloudmindai.in/article/${article.slug}`
    const text = article.title
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
    setShowShareMenu(false)
  }

  if (loading) {
    return <ArticleSkeleton />
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center text-blue-600 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-xl">{error || 'Article not found'}</p>
        </div>
      </div>
    )
  }

  const imageUrl = getImageUrl(article.image_url)
  const tags = Array.isArray(article.tags) ? article.tags : (article.tags ? article.tags.split(',').map(t => t.trim()) : [])
  const date = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const articleUrl = `https://cloudmindai.in/article/${article.slug}`
  const description = article.summary || article.content.substring(0, 160) + '...'
  const keywords = tags.join(', ')
  const readingTime = article.reading_time || Math.max(1, Math.ceil(article.content.split(' ').length / 200))

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": description,
    "image": imageUrl ? `https://cloudmindai.in${imageUrl}` : "",
    "author": {
      "@type": "Organization",
      "name": "TheCloudMind.ai"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TheCloudMind.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cloudmindai.in/logo.jpg"
      }
    },
    "datePublished": article.created_at,
    "dateModified": article.updated_at || article.created_at
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - TheCloudMind.ai</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`${keywords}, AI news, artificial intelligence, machine learning`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        {imageUrl && <meta property="og:image" content={`https://cloudmindai.in${imageUrl}`} />}
        <meta property="article:published_time" content={article.created_at} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={description} />
        {imageUrl && <meta name="twitter:image" content={`https://cloudmindai.in${imageUrl}`} />}
        <link rel="canonical" href={articleUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-blue-600 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate">{article.title.substring(0, 50)}...</span>
        </nav>

        <Link to="/" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8" data-testid="back-to-home-link">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {imageUrl && (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-8">
            <img 
              src={imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{stats.views} views</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex items-start space-x-2 mb-6">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs sm:text-sm whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleReaction('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                liked 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              data-testid="like-btn"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{stats.likes}</span>
            </button>
            
            <button
              onClick={() => handleReaction('bookmark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                bookmarked 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              data-testid="bookmark-btn"
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{stats.bookmarks}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                data-testid="share-btn"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>

              {showShareMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-10 min-w-[200px]">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 sm:p-4 mb-6 sm:mb-8 rounded-r-lg">
          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg italic leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
          {article.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-sm sm:text-base">{paragraph}</p>
          ))}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(relatedArticle => (
                <NewsCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}

export default Article
