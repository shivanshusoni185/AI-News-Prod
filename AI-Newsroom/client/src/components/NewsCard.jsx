import { Link } from 'react-router-dom'
import { Calendar, Tag } from 'lucide-react'
import { getImageUrl } from '../lib/api'

function NewsCard({ article }) {
  const imageUrl = getImageUrl(article.image_url)
  const tags = Array.isArray(article.tags) ? article.tags : (article.tags ? article.tags.split(',').map(t => t.trim()) : [])
  const date = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Link 
      to={`/article/${article.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-4xl">AI</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {article.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          {tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span>{tags[0]}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default NewsCard
