import { Link } from 'react-router-dom'
import { Mail, Youtube, Instagram, Heart } from 'lucide-react'
import logo from '../assets/logo.jpg'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="TheCloudMind.ai"
                className="h-16 w-16 rounded-full object-cover shadow-xl ring-2 ring-white/20"
              />
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TheCloudMind.ai
                </h3>
                <p className="text-sm text-gray-300">AI News & Insights</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted source for the latest AI developments, innovations, and insights.
              Stay informed about the future of artificial intelligence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-cyan-400">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:bg-white transition-colors"></span>
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-cyan-400">Connect With Us</h4>
            <div className="space-y-4">
              <div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send us a Message</span>
                </Link>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-3">Follow us on social media</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.youtube.com/@CloudMindAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 rounded-lg hover:bg-red-600 transition-all transform hover:scale-110 hover:shadow-lg"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/thecloudmind.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 rounded-lg hover:bg-pink-600 transition-all transform hover:scale-110 hover:shadow-lg"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} TheCloudMind.ai. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="hidden sm:block">•</span>
              <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
              <span className="hidden sm:block">•</span>
              <p className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for AI Enthusiasts
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
