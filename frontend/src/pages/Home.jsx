import { useCallback, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Loader } from 'lucide-react'
import NewsCard from '../components/NewsCard'
import { newsApi } from '../lib/api'

const CATEGORY_TABS = [
  { label: 'All News', value: '' },
  { label: 'AI', value: 'AI' },
  { label: 'Sports', value: 'Sports' },
]

const getArticleTags = (article) => {
  if (Array.isArray(article.tags)) {
    return article.tags
  }

  if (typeof article.tags === 'string') {
    return article.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }

  return []
}

const hasTag = (article, tag) =>
  getArticleTags(article).some((value) => value.toLowerCase() === tag.toLowerCase())

function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeTag, setActiveTag] = useState('')

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await newsApi.getAll(search, activeTag)
      setArticles(response.data)
    } catch (err) {
      console.error('Error fetching news:', err)
      setArticles([])
      setError('Unable to load news right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [activeTag, search])

  const featuredArticle = articles[0]
  const secondaryArticles = articles.slice(1, 7)
  const restArticles = articles.slice(7)
  const aiArticles = useMemo(() => articles.filter((article) => hasTag(article, 'AI')), [articles])
  const sportsArticles = useMemo(() => articles.filter((article) => hasTag(article, 'Sports')), [articles])

  const activeLabel = useMemo(
    () => CATEGORY_TABS.find((tab) => tab.value === activeTag)?.label ?? 'All News',
    [activeTag]
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <>
      <Helmet>
        <title>TheCloudMind.ai - AI and Sports Newsroom</title>
        <meta
          name="description"
          content="Direct-source AI and sports coverage, rewritten into concise original analysis for fast reading."
        />
        <meta
          name="keywords"
          content="AI news, sports news, artificial intelligence, analysis, newsroom, direct sources"
        />
        <meta property="og:title" content="TheCloudMind.ai - AI and Sports Newsroom" />
        <meta
          property="og:description"
          content="Original AI and sports coverage built from direct sources and rewritten for clarity."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cloudmindai.in/" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://cloudmindai.in/" />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="sticky top-[72px] z-30 -mx-1 mb-8 px-1 md:static md:top-auto md:z-auto md:mx-0 md:mb-10 md:px-0">
          <div className="glass-panel rounded-[26px] border-white/80 px-4 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Filter coverage
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {CATEGORY_TABS.map((tab) => {
                    const isActive = tab.value === activeTag
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => setActiveTag(tab.value)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={handleSearch} className="w-full lg:max-w-2xl">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search stories, teams, companies, markets..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:min-w-[120px]"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {activeLabel}
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Original reporting built for fast reading
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 lg:text-right">
              Source-grounded AI and sports coverage, rewritten into a cleaner editorial format for client demos, briefings, and publishing.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-200 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-lg font-medium text-red-600">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-12 text-center shadow-sm">
            <p className="text-xl text-slate-500">No articles found.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {featuredArticle && (
              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
                <div className="glass-panel overflow-hidden rounded-[34px] p-4">
                  <NewsCard article={featuredArticle} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  {secondaryArticles.slice(0, 3).map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {!activeTag && (
              <section className="grid gap-8 xl:grid-cols-2">
                {aiArticles.length > 0 && (
                  <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                          AI Desk
                        </div>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                          AI coverage strip
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTag('AI')}
                        className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        View AI
                      </button>
                    </div>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {aiArticles.slice(0, 4).map((article) => (
                        <NewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  </div>
                )}

                {sportsArticles.length > 0 && (
                  <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                          Sports Desk
                        </div>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                          Sports coverage strip
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTag('Sports')}
                        className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        View Sports
                      </button>
                    </div>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {sportsArticles.slice(0, 4).map((article) => (
                        <NewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {restArticles.length > 0 && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                      More coverage
                    </div>
                    <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                      Fresh analysis across AI and sport
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {restArticles.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Home
