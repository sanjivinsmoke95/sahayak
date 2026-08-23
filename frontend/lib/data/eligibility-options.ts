import { L } from '@/types';
import type { Localized } from '@/types';

export interface IncomeBand { id: string; value: number; label: Localized }
export interface WorkOption { id: string; label: Localized }

export const STATES: string[] = ["Andhra Pradesh","Telangana","Karnataka","Tamil Nadu","Maharashtra","Uttar Pradesh","Delhi","Other"];

export const INCOMES: IncomeBand[] = [
  { id:'i1', value: 80000,  label: L("Below ₹1,00,000", "₹1,00,000 से कम", "₹1,00,000 కంటే తక్కువ") },
  { id:'i2', value: 200000, label: L("₹1,00,000 to ₹3,00,000", "₹1,00,000 से ₹3,00,000", "₹1,00,000 నుండి ₹3,00,000") },
  { id:'i3', value: 550000, label: L("₹3,00,000 to ₹8,00,000", "₹3,00,000 से ₹8,00,000", "₹3,00,000 నుండి ₹8,00,000") },
  { id:'i4', value: 1200000,label: L("Above ₹8,00,000", "₹8,00,000 से ऊपर", "₹8,00,000 కంటే ఎక్కువ") }
];

export const WORKS: WorkOption[] = [
  { id:'retired', label: L("Retired / pensioner", "सेवानिवृत्त / पेंशनभोगी", "పదవీ విరమణ / పింఛనుదారు") },
  { id:'farmer',  label: L("Farming", "खेती", "వ్యవసాయం") },
  { id:'self',    label: L("Own work or shop", "अपना काम या दुकान", "సొంత పని లేదా దుకాణం") },
  { id:'salary',  label: L("Job with salary", "नौकरी", "జీతంతో ఉద్యోగం") },
  { id:'student', label: L("Studying", "पढ़ाई", "చదువుకుంటున్నాను") },
  { id:'home',    label: L("Household work", "गृहकार्य", "ఇంటి పని") }
];
