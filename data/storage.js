// storage.js — Firestore (cloud) + helpers locais
import {
  collection, doc, getDocs, setDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ── Helpers de coleção ──────────────────────────────────────
function uid() {
  return auth.currentUser?.uid;
}
function patientsRef()    { return collection(db, 'users', uid(), 'patients'); }
function evaluationsRef() { return collection(db, 'users', uid(), 'evaluations'); }

// ── Pacientes ───────────────────────────────────────────────
export async function getPatients() {
  const snap = await getDocs(query(patientsRef(), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function savePatient(patient) {
  const ref  = doc(patientsRef(), patient.id);
  const data = { ...patient, updatedAt: new Date().toISOString() };
  await setDoc(ref, data, { merge: true });
  return data;
}

export async function deletePatient(patientId) {
  await deleteDoc(doc(patientsRef(), patientId));
  const snap = await getDocs(query(evaluationsRef(), where('patientId', '==', patientId)));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ── Avaliações ──────────────────────────────────────────────
export async function getEvaluations(patientId = null) {
  const q = patientId
    ? query(evaluationsRef(), where('patientId', '==', patientId), orderBy('startedAt', 'desc'))
    : query(evaluationsRef(), orderBy('startedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveEvaluation(evaluation) {
  const ref  = doc(evaluationsRef(), evaluation.id);
  const data = { ...evaluation, updatedAt: new Date().toISOString() };
  await setDoc(ref, data, { merge: true });
  return data;
}

export async function deleteEvaluation(evalId) {
  await deleteDoc(doc(evaluationsRef(), evalId));
}

// ── Helpers ─────────────────────────────────────────────────
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function calcAge(dob) {
  if (!dob) return '—';
  const parts = dob.split('/');
  if (parts.length !== 3) return dob;
  const birth = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  const now   = new Date();
  let years   = now.getFullYear() - birth.getFullYear();
  let months  = now.getMonth()    - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (isNaN(years)) return dob;
  if (years < 1) return `${months}m`;
  return months > 0 ? `${years}a ${months}m` : `${years} anos`;
}
