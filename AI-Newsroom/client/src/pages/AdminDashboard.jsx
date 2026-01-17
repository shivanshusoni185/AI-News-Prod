import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Loader, Image, X, Eye, EyeOff } from 'lucide-react'
import { adminApi, getImageUrl } from '../lib/api'
import logo from '../assets/logo.jpg'

function AdminDashboard() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: '',
    published: false,
    image: null
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin/login')
      return
    }
    fetchArticles()
  }, [navigate])

  const fetchArticles = async () => {
    try {
      const response = await adminApi.getAllNews()
      setArticles(response.data)
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', summary: '', content: '', tags: '', published: false, image: null })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      tags: article.tags || '',
      published: article.published,
      image: null
    })
    setEditingId(article.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const data = new FormData()
    data.append('title', formData.title)
    data.append('summary', formData.summary)
    data.append('content', formData.content)
    data.append('tags', formData.tags)
    data.append('published', formData.published)
    if (formData.image) {
      data.append('image', formData.image)
    }

    try {
      if (editingId) {
        await adminApi.updateNews(editingId, data)
      } else {
        await adminApi.createNews(data)
      }
      resetForm()
      fetchArticles()
    } catch (error) {
      alert(error.response?.data?.detail || 'Error saving article')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      await adminApi.deleteNews(id)
      fetchArticles()
    } catch (error) {
      alert('Error deleting article')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Dashboard Header with Logo */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="TheCloudMind.ai"
              className="h-16 w-16 rounded-full object-cover shadow-lg ring-2 ring-blue-100"
            />
            <div>
              <h2 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TheCloudMind.ai
                </span>
              </h2>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Article
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Articles</h2>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Article' : 'New Article'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="AI, Machine Learning, Tech"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Image className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">
                      {formData.image ? formData.image.name : 'Choose image'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Published
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-xl mb-4">No articles yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:underline"
          >
            Create your first article
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map(article => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                      {article.image_path ? (
                        <img 
                          src={getImageUrl(article.image_path)} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{article.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    {article.published ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        <Eye className="w-4 h-4" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        <EyeOff className="w-4 h-4" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
