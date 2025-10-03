import { db, isFirebaseEnabled } from '../firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

const STORAGE_KEY = 'rdv_app_items_v1'
const COL = isFirebaseEnabled ? collection(db, 'rdvs') : null

// Read all once (ordered by createdAt desc if present, else by id)
export async function getAll() {
  if (!isFirebaseEnabled) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
  const q = query(COL, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Real-time subscription
export function subscribeAll(callback) {
  if (!isFirebaseEnabled) {
    // simulate subscription: immediate callback + storage events
    const emit = () => {
      getAll().then(callback)
    }
    emit()
    const handler = (e) => { if (e.key === STORAGE_KEY) emit() }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }
  const q = query(COL, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(list)
  })
}

// Create or update
export async function upsert(item) {
  const id = item.id || String(Date.now())
  if (!isFirebaseEnabled) {
    const items = await getAll()
    const idx = items.findIndex(x => x.id === id)
    const payload = { ...item, id, createdAt: item.createdAt || Date.now() }
    if (idx >= 0) items[idx] = payload; else items.unshift(payload)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
    // trigger storage event manually across tabs is not possible; but OK for single tab
    return payload
  }
  const ref = doc(COL, id)
  const payload = {
    clientName: item.clientName,
    location: item.location,
    accompagnant: item.accompagnant,
    date: item.date,
    time: item.time,
    responses: item.responses || ['', '', '', ''],
    createdAt: item.createdAt || serverTimestamp(),
  }
  await setDoc(ref, payload, { merge: true })
  return { id, ...payload }
}

export async function remove(id) {
  if (!isFirebaseEnabled) {
    const items = (await getAll()).filter(x => x.id !== id)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
    return
  }
  const ref = doc(COL, id)
  await deleteDoc(ref)
}

export async function getById(id) {
  if (!isFirebaseEnabled) {
    const items = await getAll()
    return items.find(x => x.id === id) || null
  }
  const ref = doc(COL, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
