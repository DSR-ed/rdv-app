import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAll, remove } from '../utils/storage'
import { generatePDF } from '../utils/pdfUtils'
import RdvCard from './RdvCard'
import FilterSort from './FilterSort'
import { parse, isSameDay, isWithinInterval, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export default function LandingPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date') // date | location | clientName
  const [sortDir, setSortDir] = useState('asc') // asc | desc
  const [period, setPeriod] = useState('all') // all | week | month

  useEffect(() => {
    setItems(getAll())
  }, [])

  const onDelete = useCallback((id) => {
    if (confirm('Confirmer la suppression de ce RDV ?')) {
      remove(id)
      setItems(getAll())
    }
  }, [])

  const onExport = useCallback((rdv) => {
    generatePDF(rdv)
  }, [])

  const filtered = useMemo(() => {
    let list = [...items]

    // search in all fields
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((it) =>
        [it.clientName, it.location, it.accompagnant, it.date, it.time]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    }

    // period filter
    if (period !== 'all') {
      const today = new Date()
      if (period === 'week') {
        const start = startOfWeek(today, { weekStartsOn: 1 })
        const end = endOfWeek(today, { weekStartsOn: 1 })
        list = list.filter((it) => {
          const d = parse(`${it.date} ${it.time}`, 'yyyy-MM-dd HH:mm', new Date())
          return isWithinInterval(d, { start, end })
        })
      }
      if (period === 'month') {
        const start = startOfMonth(today)
        const end = endOfMonth(today)
        list = list.filter((it) => {
          const d = parse(`${it.date} ${it.time}`, 'yyyy-MM-dd HH:mm', new Date())
          return isWithinInterval(d, { start, end })
        })
      }
    }

    // sort
    list.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') {
        const ad = parse(`${a.date} ${a.time}`, 'yyyy-MM-dd HH:mm', new Date()).getTime()
        const bd = parse(`${b.date} ${b.time}`, 'yyyy-MM-dd HH:mm', new Date()).getTime()
        cmp = ad - bd
      } else if (sortBy === 'location') {
        cmp = a.location.localeCompare(b.location)
      } else if (sortBy === 'clientName') {
        cmp = a.clientName.localeCompare(b.clientName)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [items, search, period, sortBy, sortDir])

  return (
    <section>
      <FilterSort
        search={search}
        onSearch={setSearch}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortBy={setSortBy}
        onSortDir={setSortDir}
        period={period}
        onPeriod={setPeriod}
      />

      <div className="grid" style={{marginTop: 16}}>
        {filtered.map((rdv) => (
          <RdvCard key={rdv.id} rdv={rdv}
            onEdit={() => navigate(`/edit/${rdv.id}`)}
            onDelete={() => onDelete(rdv.id)}
            onExport={() => onExport(rdv)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{gridColumn: '1 / -1'}}>
            <p style={{margin:0, color:'var(--text-light)'}}>Aucun RDV. Créez un nouveau rendez-vous.</p>
          </div>
        )}
      </div>
    </section>
  )
}
