import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getById, upsert } from '../utils/storage'
import { validateRdv, normalizeRdv } from '../utils/validation'

const QUESTIONS = [
  "Qu'est-ce qui a été nécessaire dans la préparation au(x) rendez-vous auxquel(s) vous avez assisté ?",
  "Qu'est-ce qui a été important dans le (les) 'entretien(s) de vente auxquel(s) vous avez participé ?",
  'Quel(s) éléments ont fait basculer la / les vente(s) ?',
  "Quel était, selon vous, l’objectif du client ? / par quelle(s) solution(s) était-il intéressé et pourquoi",
]

export default function RdvForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    clientName: '',
    location: '',
    accompagnant: '',
    date: '',
    time: '',
    responses: ['', '', '', ''],
  })
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (isEdit) {
      (async () => {
        setLoading(true)
        try {
          const existing = await getById(id)
          if (existing) {
            setForm({
              id: existing.id,
              clientName: existing.clientName || '',
              location: existing.location || '',
              accompagnant: existing.accompagnant || '',
              date: existing.date || '',
              time: existing.time || '',
              responses: existing.responses?.length === 4 ? existing.responses : ['', '', '', ''],
              createdAt: existing.createdAt || undefined,
            })
          }
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [id, isEdit])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleResponseChange(idx, value) {
    setForm((f) => {
      const next = [...(f.responses || ['', '', '', ''])]
      next[idx] = value
      return { ...f, responses: next }
    })
  }

  async function submit(e) {
    e.preventDefault()
    setSubmitError('')
    const { valid, errors } = validateRdv(form)
    setErrors(errors)
    if (!valid) return

    try {
      setLoading(true)
      const data = normalizeRdv(form)
      await upsert(data)
      navigate('/')
    } catch (err) {
      console.error(err)
      setSubmitError("Erreur d'enregistrement. Vérifiez votre connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="card">
        <h2 style={{marginTop:0}}>{isEdit ? 'Modifier le RDV' : 'Nouveau RDV'}</h2>
        <form onSubmit={submit}>
          {loading && <div style={{marginBottom:12, color:'var(--text-light)'}}>Chargement…</div>}
          {submitError && <div style={{marginBottom:12, color:'var(--danger)'}}>{submitError}</div>}
          <div className="row two">
            <div>
              <label className="label" htmlFor="clientName">Nom du client</label>
              <input id="clientName" name="clientName" className="input" type="text" value={form.clientName} onChange={handleChange} required />
              {errors.clientName && <small style={{color:'var(--danger)'}}>{errors.clientName}</small>}
            </div>
            <div>
              <label className="label" htmlFor="location">Lieu (commune)</label>
              <input id="location" name="location" className="input" type="text" value={form.location} onChange={handleChange} required list="communes" />
              {errors.location && <small style={{color:'var(--danger)'}}>{errors.location}</small>}
              {/* Autocomplétion simple via datalist (peut être enrichie plus tard) */}
              <datalist id="communes">
                <option>Paris</option>
                <option>Lyon</option>
                <option>Marseille</option>
                <option>Toulouse</option>
                <option>Bordeaux</option>
              </datalist>
            </div>
          </div>

          <div className="row two">
            <div>
              <label className="label" htmlFor="accompagnant">Nom du conseiller(re)</label>
              <input id="accompagnant" name="accompagnant" className="input" type="text" value={form.accompagnant} onChange={handleChange} required />
              {errors.accompagnant && <small style={{color:'var(--danger)'}}>{errors.accompagnant}</small>}
            </div>
            <div>
              <label className="label" htmlFor="date">Date du RDV</label>
              <input id="date" name="date" className="input" type="date" value={form.date} onChange={handleChange} required />
              {errors.date && <small style={{color:'var(--danger)'}}>{errors.date}</small>}
            </div>
          </div>

          <div className="row two">
            <div>
              <label className="label" htmlFor="time">Heure du RDV</label>
              <input id="time" name="time" className="input" type="time" value={form.time} onChange={handleChange} required />
              {errors.time && <small style={{color:'var(--danger)'}}>{errors.time}</small>}
            </div>
          </div>

          <div style={{marginTop:12}}>
            {QUESTIONS.map((q, idx) => (
              <div key={idx} style={{marginTop: idx?12:0}}>
                <label className="label">Question {idx+1}</label>
                <div style={{fontWeight:600, color:'var(--text)'}}>{q}</div>
                <textarea
                  className="textarea"
                  rows={4}
                  spellCheck={true}
                  placeholder="Votre réponse"
                  value={form.responses[idx] || ''}
                  onChange={(e)=>handleResponseChange(idx, e.target.value)}
                />
              </div>
            ))}
            {errors.responses && <small style={{color:'var(--danger)'}}>{errors.responses}</small>}
          </div>

          <div style={{display:'flex', gap:8, marginTop:16}}>
            <button type="submit" className="btn"><i className="fa-solid fa-floppy-disk"></i> Enregistrer</button>
            <button type="button" className="btn secondary" onClick={()=>navigate('/')}>Annuler</button>
          </div>
        </form>
      </div>
    </section>
  )
}
