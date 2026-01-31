'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Play, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

// Define strict types
interface SlotData {
  slot: {
    id: number;
    generated_by: string;
    campaign_type: string;
  };
  contacts: {
    phone_number: string;
  }[];
}

interface ContactRecord {
  id: number;
  phone_number: string;
}

export default function DataRequest({ onRefresh }: { onRefresh: () => void }) {
  const [config, setConfig] = useState({ duration: 5, interval: 10, type: 'New' });
  // FIXED: No more <any>
  const [generatedSlot, setGeneratedSlot] = useState<SlotData | null>(null);

  const handleExtract = async () => {
    const required = Math.ceil((config.duration * 60) / config.interval);
    
    if (config.type === 'New') {
        // Calls the RPC function we assumed exists, or uses standard query
        const { data, error } = await supabase.rpc('get_unused_contacts', { limit_count: required });
        
        if (error) {
            console.error(error);
            alert('Error fetching contacts. Make sure get_unused_contacts RPC exists or use standard query.');
            return;
        }
        // Cast data safely
        if (data) processSlot(data as ContactRecord[]);
        
    } else if (config.type === 'Old') {
        const { data } = await supabase.from('contacts').select('id, phone_number').limit(required);
        if (data) processSlot(data as ContactRecord[]);
    }
  };

  // FIXED: Explicitly typed 'contacts' instead of any[]
  const processSlot = async (contacts: ContactRecord[]) => {
      if (!contacts || contacts.length === 0) {
        alert("No data available");
        return;
      }

      // 1. Create Slot
      const { data: slot, error: slotError } = await supabase
          .from('slots')
          .insert({
              generated_by: 'Admin',
              campaign_type: config.type,
              duration_hours: config.duration,
              interval_minutes: config.interval,
              total_count: contacts.length
          })
          .select()
          .single();

      if (slotError) {
        alert('Error creating slot');
        return;
      }

      // 2. Link Contacts to Slot
      const links = contacts.map(c => ({ contact_id: c.id, slot_id: slot.id }));
      const { error: linkError } = await supabase.from('contact_slots').insert(links);

      if (!linkError) {
          setGeneratedSlot({ slot, contacts });
          onRefresh();
      }
  };

  const downloadSlot = () => {
      if (!generatedSlot) return;
      const ws = XLSX.utils.json_to_sheet(generatedSlot.contacts.map(c => ({ Phone: c.phone_number })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Slot_${generatedSlot.slot.id}`);
      XLSX.writeFile(wb, `Slot_${generatedSlot.slot.id}_Export.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
        <h2 className="font-bold text-lg mb-6">Request Campaign Data</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Duration (Hrs)</label>
                <input type="number" value={config.duration} onChange={e => setConfig({...config, duration: +e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Interval (Mins)</label>
                <input type="number" value={config.interval} onChange={e => setConfig({...config, interval: +e.target.value})} className="w-full border p-2 rounded" />
            </div>
        </div>

        <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase">Data Type</label>
            <select className="w-full border p-2 rounded bg-white" onChange={e => setConfig({...config, type: e.target.value})}>
                <option value="New">New Data (Fresh)</option>
                <option value="Old">Old Data (Reuse)</option>
                <option value="Shuffled">Shuffled (Mix)</option>
            </select>
        </div>

        <button onClick={handleExtract} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-indigo-700">
            <Play className="w-4 h-4" /> Generate Slot
        </button>

        {generatedSlot && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 animate-in fade-in">
                <p className="text-sm text-emerald-800 font-bold mb-2">Slot #{generatedSlot.slot.id} Created!</p>
                <p className="text-xs text-emerald-600 mb-3">{generatedSlot.contacts.length} numbers allocated.</p>
                <button onClick={downloadSlot} className="text-xs bg-emerald-600 text-white px-3 py-2 rounded flex items-center gap-2">
                    <Download className="w-3 h-3" /> Download Excel
                </button>
            </div>
        )}
    </div>
  );
}