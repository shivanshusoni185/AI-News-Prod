import { Link } from 'react-router-dom'
import { Calendar, Tag, Clock } from 'lucide-react'
import { getImageUrl } from '../lib/api'

function NewsCard({ article }) {
  const imageUrl = getImageUrl(article.image_url)
  const tags = Array.isArray(article.tags) ? article.tags : (article.tags ? article.tags.split(',').map(t => t.trim()) : [])
  const date = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate reading time (approx 200 words per minute)
  const readingTime = article.reading_time || Math.max(1, Math.ceil((article.content?.split(' ').length || article.summary.split(' ').length) / 200))

  return (
    <Link
      to={`/article/${article.slug}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
      data-testid="news-card"
    >
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-600 text-4xl">AI</span>
          </div>
        )}
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-tight">
          {article.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{readingTime} min read</span>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">{tags[0]}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default NewsCard
