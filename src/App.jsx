import { Routes, Route, Link, useLocation } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import RdvForm from './components/RdvForm'

function Header() {
  const location = useLocation()
  return (
    <header className="container">
      <div className="header">
        <h1 style={{margin:0}}>Gestion RDV - Edouard Lambert</h1>
        {location.pathname !== '/new' && (
          <Link className="btn" to="/new">
            <i className="fa-solid fa-plus"></i> Nouveau RDV
          </Link>
        )}
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
