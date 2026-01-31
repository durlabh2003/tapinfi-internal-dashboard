'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx'; 
import { supabase } from '@/lib/supabase';
import { Calculator as CalcIcon, Download, Play, RefreshCw } from 'lucide-react';

export default function Calculator({ onExtractionComplete }: { onExtractionComplete: () => void }) {
  const [duration, setDuration] = useState<number>(0);
  const [interval, setInterval] = useState<number>(0);
  const [required, setRequired] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculate = () => {
    if (duration > 0 && interval > 0) {
      const count = Math.ceil((duration * 60) / interval);
      setRequired(count);
    }
  };

  const executeCampaign = async () => {
    if (required <= 0) return;
    setIsProcessing(true);

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, phone_number')
      .eq('status', 'Unused')
      .order('created_at', { ascending: true })
      .limit(required);

    if (error || !contacts || contacts.length === 0) {
      alert('Not enough unused contacts available!');
      setIsProcessing(false);
      return;
    }

    const idsToUpdate = contacts.map(c => c.id);
    await supabase
      .from('contacts')
      .update({ status: 'Used', updated_at: new Date().toISOString() })
      .in('id', idsToUpdate);

    setExtractedData(contacts);
    onExtractionComplete();
    setIsProcessing(false);
  };

  const downloadCSV = () => {
    const ws = XLSX.utils.json_to_sheet(extractedData.map(c => ({ Phone: c.phone_number })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Campaign_Leads");
    XLSX.writeFile(wb, `campaign_leads_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <CalcIcon className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Campaign Planner</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Hours)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300" 
              placeholder="e.g. 4"
              onChange={(e) => setDuration(Number(e.target.value))}
              onBlur={calculate}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interval (Minutes)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300"
              placeholder="e.g. 10"
              onChange={(e) => setInterval(Number(e.target.value))}
              onBlur={calculate}
            />
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-50 rounded-xl p-4 gap-4 border border-slate-100">
          <div>
             <p className="text-sm text-slate-500 font-medium">Est. Contacts Needed</p>
             <p className="text-3xl font-bold text-indigo-600">{required}</p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={executeCampaign}
                disabled={required === 0 || isProcessing}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4 fill-current"/>}
                {extractedData.length > 0 ? 'Recalculate' : 'Extract Leads'}
             </button>

             {extractedData.length > 0 && (
                <button 
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-600/20"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
             )}
          </div>
        </div>

        {/* List View */}
        {extractedData.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Generated List Preview</h3>
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 text-xs text-slate-500 font-bold uppercase sticky top-0">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Phone Number</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {extractedData.map((c, i) => (
                                <tr key={c.id} className="text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium">{c.phone_number}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            Extracted
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}