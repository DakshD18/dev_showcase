import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import AnimatedPage from '../components/AnimatedPage'

/* ─── Floating ambient blob (theme-aware) ─── */
const Blob = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(90px)',
      opacity: 1,
      animation: 'blob-move 14s ease-in-out infinite',
      ...style,
    }}
  />
)

/* ─── GitHub-style tech tag ─── */
const TechTag = ({ name }) => (
  <span style={{
    padding: '0.1rem 0.55rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    borderRadius: '9999px',
    background: 'var(--info-bg)',
    color: 'var(--accent-primary)',
    border: '1px solid var(--info-border)',
    whiteSpace: 'nowrap',
  }}>
    {name}
  </span>
)

/* ─── Project Card — GitHub-repo style ─── */
const ProjectCard = ({ project, match_percentage, reason, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.07 }}
    whileHover={{ y: -4 }}
    style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      cursor: 'pointer',
      position: 'relative',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--border-accent)'
      e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow-sm)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border-primary)'
      e.currentTarget.style.boxShadow = 'none'
    }}
  >
    <Link to={`/project/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1.375rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {/* Repo icon */}
          <div style={{
            width: 20, height: 20, marginTop: 2, flexShrink: 0, opacity: 0.5,
            color: 'var(--text-secondary)',
          }}>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-link)',
            letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {project.title}
          </h3>
        </div>

        {/* Description */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          marginBottom: '0.875rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}>
          {project.short_description || 'No description provided.'}
        </p>

        {reason && (
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
            💡 {reason}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.5rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--border-muted)',
          marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-success">Published</span>
            {match_percentage !== null && (
              <span className="badge badge-primary">{match_percentage}% Match</span>
            )}
            {project.sandbox_available && (
              <span className="badge badge-primary">🧪 Sandbox</span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {project.owner_username}
          </span>
        </div>

      </div>
    </Link>
  </motion.div>
)

/* ─── Feature pill for hero section ─── */
const FeaturePill = ({ icon, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.3rem 0.8rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  }}>
    {icon} {label}
  </span>
)

/* ─── Main Home Component ─── */
const Home = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects/')
      setProjects(data.filter(p => p.is_published))
    } catch {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleAISearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return }
    setSearching(true)
    try {
      const { data } = await axios.post('/api/projects/search/ai/', { query: searchQuery })
      setSearchResults(data.results)
    } catch {
      toast.error('AI search failed')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const displayProjects = searchResults !== null
    ? searchResults
    : projects.map(p => ({ project: p, match_percentage: null }))

  return (
    <AnimatedPage>
      <div style={{ minHeight: 'calc(100vh - 60px)' }}>

        {/* ─── Hero Section ─── */}
        <section style={{ position: 'relative', padding: '5.5rem 0 4rem', textAlign: 'center', overflow: 'hidden' }}>
          {/* Ambient blobs — theme-aware */}
          <Blob style={{ width: 550, height: 550, background: 'var(--hero-blob-a)', top: '-200px', left: '-120px', animationDelay: '0s' }} />
          <Blob style={{ width: 450, height: 450, background: 'var(--hero-blob-b)', top: '-80px', right: '-120px', animationDelay: '-5s' }} />
          <Blob style={{ width: 350, height: 350, background: 'var(--hero-blob-c)', bottom: '-120px', left: '35%', animationDelay: '-9s' }} />

          {/* Subtle top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)',
            opacity: 0.5,
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}
            >
              <FeaturePill icon="⚡" label="Live API Sandbox" />
              <FeaturePill icon="🤖" label="AI-Powered Search" />
              <FeaturePill icon="📊" label="Architecture Visualizer" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.25rem, 6vw, 4rem)',
                fontWeight: 800,
                marginBottom: '1.25rem',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
              }}
            >
              Explore Developer<br />
              <span className="text-gradient">Projects Interactively</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              style={{
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                maxWidth: '520px',
                margin: '0 auto 2.25rem',
                lineHeight: 1.7,
              }}
            >
              Discover, test, and understand APIs through live sandboxes. No setup required.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.33 }}
              style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: 'var(--shadow-glow)' }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.75rem', fontSize: '0.9375rem' }}
                >
                  ✦ Get Started Free
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.75rem', fontSize: '0.9375rem' }}
              >
                Browse Projects ↓
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{
                display: 'flex', justifyContent: 'center',
                gap: '2rem', marginTop: '3.5rem', flexWrap: 'wrap',
              }}
            >
              {[
                { value: projects.length || '—', label: 'Live Projects' },
                { value: '∞', label: 'API Endpoints' },
                { value: 'AI', label: 'Powered Search' },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div className="text-gradient" style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 500,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginTop: '0.2rem',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-muted)', margin: '0 2rem' }} />

        {/* ─── Projects Section ─── */}
        <section id="projects-section" style={{ padding: '4rem 0 5rem' }}>
          <div className="container">

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                  {searchResults !== null ? 'Search Results' : 'Explore Projects'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {searchResults !== null
                    ? `${displayProjects.length} project${displayProjects.length !== 1 ? 's' : ''} found`
                    : 'Test live APIs and explore architecture in real-time'}
                </p>
              </motion.div>
            </div>

            {/* AI Search Bar — GitHub-search look */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              style={{ marginBottom: '2rem', display: 'flex', gap: '0.625rem', maxWidth: '680px', alignItems: 'center' }}
            >
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  fontSize: '0.875rem', pointerEvents: 'none',
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search with AI: 'e-commerce React', 'auth API'..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAISearch()}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAISearch}
                disabled={searching || !searchQuery.trim()}
                className="btn btn-blue"
                style={{ minWidth: '110px', flexShrink: 0, fontSize: '0.875rem' }}
              >
                {searching ? (
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    Thinking…
                  </motion.span>
                ) : '⚡ Search'}
              </motion.button>
              <AnimatePresence>
                {searchResults !== null && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => { setSearchQuery(''); setSearchResults(null) }}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.875rem' }}
                  >
                    ✕ Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Cards grid */}
            {loading ? (
              <div className="card-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.375rem',
                  }}>
                    <div className="skeleton" style={{ height: '16px', width: '55%', marginBottom: '0.625rem' }} />
                    <div className="skeleton" style={{ height: '12px', width: '30%', marginBottom: '1rem' }} />
                    <div className="skeleton" style={{ height: '56px', marginBottom: '1rem' }} />
                    <div className="skeleton" style={{ height: '1px', marginBottom: '0.875rem' }} />
                    <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-grid">
                {displayProjects.map(({ project, match_percentage, reason }, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    match_percentage={match_percentage}
                    reason={reason}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && displayProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-xl)',
                  textAlign: 'center',
                  padding: '4rem 2rem',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  {searchResults !== null ? '🔍' : '📁'}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {searchResults !== null ? 'No matches found' : 'No projects yet'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {searchResults !== null
                    ? 'Try different keywords'
                    : 'Be the first to create one!'}
                </p>
              </motion.div>
            )}

          </div>
        </section>
      </div>
    </AnimatedPage>
  )
}

export default Home
