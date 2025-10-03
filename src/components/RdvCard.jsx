import { parse, isSameDay, isAfter } from 'date-fns'

function getStatus(dateStr, timeStr) {
  const d = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date())
  const now = new Date()
  if (isSameDay(d, now)) return 'today'
  return isAfter(d, now) ? 'future' : 'past'
}

export default function RdvCard({ rdv, onEdit, onDelete, onExport }) {
  const status = getStatus(rdv.date, rdv.time)
  const chipLabel = status === 'today' ? "Aujourd'hui" : status === 'future' ? 'À venir' : 'Passé'

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:12}}>
        <div>
          <h3 style={{margin:'0 0 6px 0'}}>{rdv.clientName}</h3>
          <div style={{color:'var(--text-light)', fontSize:14}}>
            <div><i className="fa-regular fa-calendar"></i> {rdv.date} · {rdv.time}</div>
            <div><i className="fa-solid fa-location-dot"></i> {rdv.location}</div>
            <div><i className="fa-regular fa-user"></i> {rdv.accompagnant}</div>
          </div>
        </div>
        <span className={`chip ${status}`}>{chipLabel}</span>
      </div>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <button className="btn secondary" onClick={onEdit} title="Modifier">
          <i className="fa-solid fa-pen"></i> Modifier
        </button>
        <button className="btn danger" onClick={onDelete} title="Supprimer">
          <i className="fa-solid fa-trash"></i> Supprimer
        </button>
        <button className="btn" onClick={onExport} title="Exporter en PDF">
          <i className="fa-solid fa-file-pdf"></i> Export PDF
        </button>
      </div>
    </div>
  )
}
