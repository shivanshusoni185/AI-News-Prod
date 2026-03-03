import { Routes, Route } from 'react-router-dom'
import { DarkModeProvider } from './lib/DarkModeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Home from './pages/Home'
import Article from './pages/Article'
import LatestNews from './pages/LatestNews'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ContactUs from './pages/ContactUs'
import AboutUs from './pages/AboutUs'

function App() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/latest-news" element={<LatestNews />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </DarkModeProvider>
  )
}

export default App
