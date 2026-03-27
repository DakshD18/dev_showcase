import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'
import AnimatedPage from '../components/AnimatedPage'

const StatusBadge = ({ published }) =>
  published ? (
    <span className="badge badge-success">Published</span>
  ) : (
    <span className="badge badge-gray">Draft</span>
  )

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const { user } = useContext(AuthContext)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects/')
      setProjects(data.filter(p => p.owner_username === user.username))
    } catch {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    setDeleting(slug)
    try {
      await axios.delete(`/api/projects/${slug}/delete/`)
      toast.success('Project deleted')
      setProjects(prev => prev.filter(p => p.slug !== slug))
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeleting(null)
    }
  }

  const published = projects.filter(p => p.is_published).length
  const drafts = projects.length - published

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '2rem' }}
        >
          {/* Welcome banner — uses theme-aware bg-secondary */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Accent line at left */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: '3px',
              background: 'var(--accent-gradient)',
              borderRadius: '3px 0 0 3px',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <p style={{
                  color: 'var(--accent-primary)',
                  fontWeight: 600, fontSize: '0.72rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginBottom: '0.3rem',
                }}>
                  Developer Studio
                </p>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                  {user?.username}'s Projects
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Manage and showcase your developer projects
                </p>
              </div>
              <Link to="/project/new">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                >
                  + New Project
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Total Projects', value: projects.length, color: 'var(--accent-primary)' },
                { label: 'Published', value: published, color: 'var(--success)' },
                { label: 'Drafts', value: drafts, color: 'var(--warning)' },
              ].map(({ label, value, color }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.25rem',
                    textAlign: 'center',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                >
                  <div style={{ fontSize: '1.625rem', fontWeight: 700, color, letterSpacing: '-0.03em' }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem', fontWeight: 500 }}>
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Projects header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '0.875rem',
          borderBottom: '1px solid var(--border-primary)',
          marginBottom: '1.25rem',
        }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Repositories ({projects.length})
          </h2>
        </div>

        {/* Project list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
              }}>
                <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '0.625rem' }} />
                <div className="skeleton" style={{ height: '12px', marginBottom: '0.875rem' }} />
                <div className="skeleton" style={{ height: '22px', width: '25%' }} />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.25rem',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Coloured left accent — green = published, yellow = draft */}
                  <div style={{
                    position: 'absolute', top: '0.875rem', left: 0,
                    width: '3px', height: '1.25rem', borderRadius: '0 2px 2px 0',
                    background: project.is_published ? 'var(--success)' : 'var(--warning)',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Left: info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <Link
                          to={`/project/${project.slug}`}
                          style={{
                            fontSize: '0.9375rem', fontWeight: 600,
                            color: 'var(--text-link)', textDecoration: 'none',
                          }}
                          onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.target.style.textDecoration = 'none'}
                        >
                          {project.title}
                        </Link>
                        <StatusBadge published={project.is_published} />
                      </div>
                      <p style={{
                        color: 'var(--text-secondary)', fontSize: '0.8125rem',
                        lineHeight: 1.55,
                        display: '-webkit-box', WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {project.short_description || 'No description'}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <Link to={`/project/${project.slug}`}>
                        <button className="btn btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                          View
                        </button>
                      </Link>
                      <Link to={`/project/edit/${project.slug}`}>
                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(project.slug)}
                        disabled={deleting === project.slug}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        {deleting === project.slug ? '…' : '✕'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center', padding: '4rem 2rem',
              marginTop: '1rem',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No repositories yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Create your first project to get started
            </p>
            <Link to="/project/new">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
              >
                Create Your First Project
              </motion.button>
            </Link>
          </motion.div>
        )}

      </div>
    </AnimatedPage>
  )
}

export default Dashboard
