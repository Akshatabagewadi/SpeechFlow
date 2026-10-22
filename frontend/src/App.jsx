
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AudioLines, BookOpenText, Check, ChevronRight, Clock3, Copy,
  FileText, Headphones, Languages, LayoutDashboard, LoaderCircle,
  Mic, MicOff, MoreHorizontal, Pencil, Plus, Search, Sparkles,
  Trash2, X
} from 'lucide-react'
import { api } from './services/api'
import { createSpeechRecognition } from './hooks/speechRecognition'

const languages = [
  ['en-US', 'English (US)'],
  ['en-IN', 'English (India)'],
  ['hi-IN', 'Hindi'],
  ['kn-IN', 'Kannada'],
  ['ta-IN', 'Tamil'],
  ['te-IN', 'Telugu'],
  ['mr-IN', 'Marathi'],
  ['bn-IN', 'Bengali'],
  ['es-ES', 'Spanish'],
  ['fr-FR', 'French']
]

const dateLabel = value =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Just now'

const blankForm = {
  title: '',
  content: '',
  language: 'en-US'
}

export default function App() {
  const [page, setPage] = useState('studio')
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('en-US')
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [status, setStatus] = useState('Ready')
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [details, setDetails] = useState(null)
  const [form, setForm] = useState(blankForm)

  const recognition = useRef(null)

  const load = async (q = search) => {
    setLoading(true)
    try {
      const data = await api.list(q)
      setRecords(data)
      setError('')
    } catch (e) {
      setError(
        `Could not load saved history. Check the backend and MySQL. ${e.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => load(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    return () => {
      try {
        recognition.current?.stop()
      } catch {}
    }
  }, [])

  const stop = () => {
    try {
      recognition.current?.stop()
    } catch {}

    recognition.current = null
    setRecording(false)
    setInterim('')
    setStatus('Ready')
  }

  const start = () => {
    setError('')

    const provider = createSpeechRecognition({
      language,
      onStatus: s => {
        setStatus(s)
        setRecording(s === 'Listening')
      },
      onError: e => {
        setError(e)
        setRecording(false)
        setStatus('Needs attention')
      },
      onText: ({ finalText, interim: partial }) => {
        if (finalText) {
          setTranscript(old =>
            `${old}${old && !old.endsWith(' ') ? ' ' : ''}${finalText}`.trimStart()
          )
        }
        setInterim(partial)
      }
    })

    if (!provider) return

    recognition.current = provider

    try {
      provider.start()
    } catch (e) {
      setError(e.message || 'Could not start microphone.')
      setRecording(false)
    }
  }

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Copied to clipboard')
      setTimeout(() => setNotice(''), 2500)
    } catch {
      setError('Clipboard access was blocked by your browser.')
    }
  }

  const save = async () => {
    if (!transcript.trim()) {
      setError('Add or dictate some text before saving.')
      return
    }

    setError('')

    try {
      await api.create({
        title:
          title.trim() ||
          `Untitled transcription ${new Date().toLocaleDateString()}`,
        content: transcript.trim(),
        language
      })

      setNotice('Transcription saved successfully')
      setTimeout(() => setNotice(''), 2800)

      setTitle('')
      setTranscript('')
      setInterim('')
      setSearch('')

      await load('')
    } catch (e) {
      setError(`Save failed: ${e.message}`)
    }
  }

  const openEdit = record => {
    setEditing(record)
    setForm({
      title: record.title,
      content: record.content,
      language: record.language
    })
  }

  const saveEdit = async () => {
    try {
      await api.update(editing.id, form)
      setEditing(null)
      setNotice('Changes saved')
      setTimeout(() => setNotice(''), 2500)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async record => {
    if (!window.confirm(`Delete "${record.title}"? This cannot be undone.`)) {
      return
    }

    try {
      await api.remove(record.id)
      setNotice('Transcription deleted')
      setTimeout(() => setNotice(''), 2500)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const totalWords = useMemo(
    () => (transcript.trim().match(/\S+/g) || []).length,
    [transcript]
  )

  const totalMinutes = useMemo(
    () =>
      records.reduce(
        (sum, r) =>
          sum + Math.max(1, Math.round((r.content || '').split(/\s+/).length / 130)),
        0
      ),
    [records]
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <AudioLines size={22} />
          </div>
          <span>
            speech<span className="brand-accent">flow</span>
          </span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <button
          className={`nav-item ${page === 'studio' ? 'active' : ''}`}
          onClick={() => setPage('studio')}
        >
          <LayoutDashboard size={18} />
          <span>Studio</span>
          <ChevronRight className="nav-chevron" size={15} />
        </button>

        <button
          className={`nav-item ${page === 'history' ? 'active' : ''}`}
          onClick={() => setPage('history')}
        >
          <BookOpenText size={18} />
          <span>Transcription history</span>
          <span className="nav-count">{records.length}</span>
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={18} />
            </div>
            <strong>Your words, organized.</strong>
            <p>Capture ideas, meetings, and moments in one place.</p>
          </div>

          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>SpeechFlow</strong>
              <small>Personal workspace</small>
            </div>
            <MoreHorizontal size={19} className="muted" />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {page === 'studio' ? 'Studio' : 'Transcription history'}
            </strong>
          </div>

          <div className="top-actions">
            <span className="system-status">
              <span className="status-dot" />
              Local workspace
            </span>
            <div className="avatar avatar-small">S</div>
          </div>
        </header>

        <div className="content">
          {error && (
            <div className="alert error-alert">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {notice && (
            <div className="alert success-alert">
              <Check size={17} />
              {notice}
            </div>
          )}

          {page === 'studio' ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={14} /> YOUR VOICE, IN TEXT
                  </div>
                  <h1>
                    Good ideas deserve
                    <br className="mobile-break" /> to be remembered.
                  </h1>
                  <p>
                    Speak naturally. Watch your words appear. Save what matters.
                  </p>
                </div>

                <div className="heading-art">
                  <div className="art-orbit orbit-one" />
                  <div className="art-orbit orbit-two" />
                  <div className="art-core">
                    <AudioLines size={35} />
                  </div>
                  <span className="art-dot dot-a" />
                  <span className="art-dot dot-b" />
                  <span className="art-dot dot-c" />
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span>Saved transcriptions</span>
                    <strong>{records.length}</strong>
                    <small>In your workspace</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon mint">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <span>Estimated speaking time</span>
                    <strong>
                      {totalMinutes} <em>min</em>
                    </strong>
                    <small>Based on saved words</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon peach">
                    <Languages size={18} />
                  </div>
                  <div>
                    <span>Language options</span>
                    <strong>10</strong>
                    <small>Choose what you speak</small>
                  </div>
                </div>
              </div>

              <section className="studio-card">
                <div className="section-heading">
                  <div>
                    <div className="section-icon">
                      <Mic size={18} />
                    </div>
                    <div>
                      <h2>Live transcription</h2>
                      <p>Your personal voice capture studio</p>
                    </div>
                  </div>

                  <div
                    className={`record-state ${recording ? 'is-recording' : ''}`}
                  >
                    <span />
                    {status}
                  </div>
                </div>

                <div className="record-controls">
                  <label className="language-field">
                    <span>Speech language</span>
                    <div className="select-wrap">
                      <Languages size={17} />
                      <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        disabled={recording}
                      >
                        {languages.map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <div className="record-buttons">
                    {!recording ? (
                      <button className="btn-primary" onClick={start}>
                        <Mic size={17} /> Start recording
                      </button>
                    ) : (
                      <button className="btn-stop" onClick={stop}>
                        <MicOff size={17} /> Stop recording
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={`transcript-box ${recording ? 'listening' : ''}`}
                >
                  <div className="transcript-box-top">
                    <span>
                      <span className="live-dot" /> LIVE TRANSCRIPT
                    </span>
                    <span>{totalWords} words</span>
                  </div>

                  <textarea
                    aria-label="Transcribed text"
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="Your words will appear here as you speak… You can also type or paste text manually."
                  />

                  {interim && <div className="interim-text">{interim}</div>}

                  {!transcript && !interim && (
                    <div className="empty-prompt">
                      <div className="waveform">
                        {Array.from({ length: 25 }, (_, i) => (
                          <i
                            key={i}
                            style={{
                              height: `${8 + ((i * 17 + 9) % 23)}px`
                            }}
                          />
                        ))}
                      </div>
                      <span>
                        Press “Start recording” and begin speaking
                      </span>
                    </div>
                  )}

                  <div className="transcript-footer">
                    <span>
                      <span className="secure-dot" />
                      Your transcript stays in this editor until you save it.
                    </span>
                    <button
                      className="text-button"
                      onClick={() => {
                        setTranscript('')
                        setInterim('')
                      }}
                      disabled={!transcript && !interim}
                    >
                      Clear text
                    </button>
                  </div>
                </div>

                <div className="save-row">
                  <label className="title-field">
                    <span>
                      Title <small>(optional)</small>
                    </span>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Monday team meeting"
                    />
                  </label>

                  <div className="save-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => copyText(transcript)}
                      disabled={!transcript.trim()}
                    >
                      <Copy size={16} /> Copy text
                    </button>
                    <button
                      className="btn-primary"
                      onClick={save}
                      disabled={!transcript.trim()}
                    >
                      <Plus size={17} /> Save transcription
                    </button>
                  </div>
                </div>
              </section>

              <section className="recent-section">
                <div className="section-heading recent-heading">
                  <div>
                    <h2>Recent transcriptions</h2>
                    <p>Pick up where you left off</p>
                  </div>
                  <button
                    className="link-button"
                    onClick={() => setPage('history')}
                  >
                    View all <ChevronRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="loading">
                    <LoaderCircle className="spin" /> Loading history…
                  </div>
                ) : records.length ? (
                  <div className="recent-list">
                    {records.slice(0, 3).map(r => (
                      <RecordRow
                        key={r.id}
                        record={r}
                        onView={() => setDetails(r)}
                        onEdit={() => openEdit(r)}
                        onDelete={() => remove(r)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    onCreate={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  />
                )}
              </section>
            </>
          ) : (
            <>
              <div className="history-heading">
                <div>
                  <div className="eyebrow">
                    <BookOpenText size={14} /> YOUR LIBRARY
                  </div>
                  <h1>Transcription history</h1>
                  <p>Every saved thought, all in one searchable place.</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setPage('studio')}
                >
                  <Plus size={17} /> New transcription
                </button>
              </div>

              <div className="history-toolbar">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search titles and transcript text…"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <span className="result-count">
                  {records.length}{' '}
                  {records.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              {loading ? (
                <div className="loading">
                  <LoaderCircle className="spin" /> Loading history…
                </div>
              ) : records.length ? (
                <div className="history-list">
                  {records.map(r => (
                    <RecordRow
                      key={r.id}
                      record={r}
                      onView={() => setDetails(r)}
                      onEdit={() => openEdit(r)}
                      onDelete={() => remove(r)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  searched={!!search}
                  onCreate={() => setPage('studio')}
                />
              )}
            </>
          )}

          <footer className="footer">
            <span>© 2026 SpeechFlow</span>
            <span>
              Made for thoughts worth keeping <span className="heart">♥</span>
            </span>
          </footer>
        </div>
      </main>

      {editing && (
        <Modal
          title="Edit transcription"
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              saveEdit()
            }}
            className="edit-form"
          >
            <label>
              Title
              <input
                required
                maxLength="160"
                value={form.title}
                onChange={e =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </label>

            <label>
              Language
              <select
                value={form.language}
                onChange={e =>
                  setForm({ ...form, language: e.target.value })
                }
              >
                {languages.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Transcription text
              <textarea
                required
                rows="8"
                value={form.content}
                onChange={e =>
                  setForm({ ...form, content: e.target.value })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                <Check size={16} /> Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {details && (
        <Modal
          title={details.title}
          onClose={() => setDetails(null)}
        >
          <div className="detail-meta">
            <span>
              <Languages size={14} />
              {languages.find(x => x[0] === details.language)?.[1] ||
                details.language}
            </span>
            <span>
              <Clock3 size={14} />
              {dateLabel(details.createdAt)}
            </span>
          </div>

          <div className="detail-content">{details.content}</div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => copyText(details.content)}
            >
              <Copy size={16} /> Copy text
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setDetails(null)
                openEdit(details)
              }}
            >
              <Pencil size={16} /> Edit
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RecordRow({ record, onView, onEdit, onDelete }) {
  return (
    <article className="record-row">
      <button
        className="record-file-icon"
        onClick={onView}
        aria-label={`View ${record.title}`}
      >
        <FileText size={19} />
      </button>

      <button className="record-main" onClick={onView}>
        <strong>{record.title}</strong>
        <span>{record.content}</span>
        <small>
          <Languages size={13} />
          {languages.find(x => x[0] === record.language)?.[1] ||
            record.language}
          <i />
          <Clock3 size={13} />
          {dateLabel(record.createdAt)}
        </small>
      </button>

      <div className="record-actions">
        <button onClick={onEdit} aria-label="Edit transcription" title="Edit">
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete transcription"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}

function EmptyState({ searched, onCreate }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Headphones size={25} />
      </div>
      <h3>
        {searched ? 'No matching transcriptions' : 'Your story starts here'}
      </h3>
      <p>
        {searched
          ? 'Try a different search term.'
          : 'Record your first thought and it will be waiting for you here.'}
      </p>
      {!searched && (
        <button className="btn-secondary" onClick={onCreate}>
          <Plus size={16} /> Create a transcription
        </button>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

