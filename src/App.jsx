import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import RdvForm from './components/RdvForm'
import { toggleTheme } from './utils/theme'

function Header() {
  const location = useLocation()
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light')
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  const onToggleTheme = () => setTheme(toggleTheme())
  return (
    <header className="container">
      <div className="header">
        <h1 style={{margin:0}}>Gestion RDV - Edouard Lambert</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="theme-toggle" role="button" aria-label="Basculer thème" title={`Thème: ${theme}`} onClick={onToggleTheme}>
            <i className="fa-solid fa-sun icon sun" aria-hidden="true" />
            <i className="fa-solid fa-moon icon moon" aria-hidden="true" />
            <div className="knob" />
          </div>
          {location.pathname !== '/new' && (
            <Link className="btn" to="/new">
              <i className="fa-solid fa-plus"></i> Nouveau RDV
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container" style={{paddingTop: 0}}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new" element={<RdvForm />} />
          <Route path="/edit/:id" element={<RdvForm />} />
        </Routes>
      </main>
    </>
  )
}
