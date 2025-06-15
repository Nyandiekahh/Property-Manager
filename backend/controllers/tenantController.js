import { db } from '../config/firebaseClient.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const getAllTenants = async () => {
  const tenantsCol = collection(db, 'Tenants');
  const tenantSnapshot = await getDocs(tenantsCol);
  return tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTenant = async (tenantData) => {
  const tenantsCol = collection(db, 'Tenants');
  const docRef = await addDoc(tenantsCol, tenantData);
  return docRef.id;
};

export const updateTenant = async (tenantId, updatedData) => {
  const tenantRef = doc(db, 'Tenants', tenantId);
  await updateDoc(tenantRef, updatedData);
  return tenantId;
};

export const deleteTenant = async (tenantId) => {
  const tenantRef = doc(db, 'Tenants', tenantId);
  await deleteDoc(tenantRef);
  return tenantId;
};
