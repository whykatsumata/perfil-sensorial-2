// storage.js — Firestore (cloud) + helpers locais
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';

const TRASH_DAYS = 30; // dias até expirar da lixeira

// ── Helpers de coleção ──────────────────────────────────────
function uid() {
  const u = auth.currentUser?.uid;
  if (!u) throw new Error('Usuário não autenticado.');
  return u;
}
function patientsRef()    { return collection(db, 'users', uid(), 'patients'); }
function evaluationsRef() { return collection(db, 'users', uid(), 'evaluations'); }
function trashRef()       { return collection(db, 'users', uid(), 'trash'); }

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
  // Busca apenas o documento específico (não todos)
  const patientSnap = await getDoc(doc(patientsRef(), patientId));
  if (patientSnap.exists()) {
    await setDoc(doc(trashRef(), `patient_${patientId}`), {
      type: 'patient',
      data: { id: patientId, ...patientSnap.data() },
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + TRASH_DAYS * 86400000).toISOString(),
    });
  }
  // Move avaliações do paciente para a lixeira também
  const evalSnap = await getDocs(query(evaluationsRef(), where('patientId', '==', patientId)));
  await Promise.all(evalSnap.docs.map(async d => {
    await setDoc(doc(trashRef(), `eval_${d.id}`), {
      type: 'evaluation',
      data: { id: d.id, ...d.data() },
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + TRASH_DAYS * 86400000).toISOString(),
    });
    await deleteDoc(d.ref);
  }));
  await deleteDoc(doc(patientsRef(), patientId));
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
  const evalSnap = await getDoc(doc(evaluationsRef(), evalId));
  if (evalSnap.exists()) {
    await setDoc(doc(trashRef(), `eval_${evalId}`), {
      type: 'evaluation',
      data: { id: evalId, ...evalSnap.data() },
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + TRASH_DAYS * 86400000).toISOString(),
    });
  }
  await deleteDoc(doc(evaluationsRef(), evalId));
}

// ── Lixeira ─────────────────────────────────────────────────
export async function getTrash() {
  const snap = await getDocs(query(trashRef(), orderBy('deletedAt', 'desc')));
  return snap.docs.map(d => ({ trashId: d.id, ...d.data() }));
}

export async function restoreFromTrash(trashId) {
  const trashSnap = await getDoc(doc(trashRef(), trashId));
  if (!trashSnap.exists()) return;
  const { type, data } = trashSnap.data();
  if (type === 'patient') {
    await setDoc(doc(patientsRef(), data.id), data);
  } else if (type === 'evaluation') {
    await setDoc(doc(evaluationsRef(), data.id), data);
  }
  await deleteDoc(trashSnap.ref);
}

export async function deleteFromTrash(trashId) {
  await deleteDoc(doc(trashRef(), trashId));
}

export async function emptyTrash() {
  const snap = await getDocs(query(trashRef()));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ── Perfil do usuário ───────────────────────────────────────
export async function saveUserProfile(userObj) {
  try {
    const { doc: firestoreDoc, setDoc: firestoreSetDoc } = await import('firebase/firestore');
    await firestoreSetDoc(
      firestoreDoc(db, 'userProfiles', userObj.uid),
      {
        uid:         userObj.uid,
        email:       userObj.email       || '',
        displayName: userObj.displayName || '',
        updatedAt:   new Date().toISOString(),
      },
      { merge: true }
    );
  } catch { /* silencia erros de perfil */ }
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
