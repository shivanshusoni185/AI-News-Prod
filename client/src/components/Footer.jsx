import { Link } from 'react-router-dom'
import { Mail, Youtube, Instagram, Heart, Send } from 'lucide-react'
import { useState } from 'react'
import { newsletterApi } from '../lib/api'
import logo from '../assets/logo.jpg'

function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await newsletterApi.subscribe(email)
      setMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' })
      setEmail('')
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to subscribe. Please try again.' 
      })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-white mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="TheCloudMind.ai"
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-xl ring-2 ring-white/20"
              />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TheCloudMind.ai
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">AI News & Insights</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Your trusted source for the latest AI developments, innovations, and insights.
              Stay informed about the future of artificial intelligence.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-3">
              <h4 className="font-semibold text-sm sm:text-base mb-2 text-cyan-400">Subscribe to Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                  data-testid="newsletter-email-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-700 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
                  data-testid="newsletter-subscribe-btn"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {message.text && (
                <p className={`mt-2 text-xs sm:text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-cyan-400">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/latest-news" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-cyan-400">Connect With Us</h4>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Send us a Message</span>
                </Link>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">Follow us on social media</p>
                <div className="flex gap-2 sm:gap-3">
                  <a
                    href="https://www.youtube.com/@CloudMindAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-3 bg-white/10 rounded-lg hover:bg-red-600 transition-all transform hover:scale-110 hover:shadow-lg"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/thecloudmind.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-3 bg-white/10 rounded-lg hover:bg-pink-600 transition-all transform hover:scale-110 hover:shadow-lg"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
              &copy; {currentYear} TheCloudMind.ai. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="hidden sm:block">•</span>
              <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
              <span className="hidden sm:block">•</span>
              <p className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500" /> for AI Enthusiasts
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
