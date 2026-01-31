'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, History, CheckCircle, XCircle } from 'lucide-react';

// 1. Define strict types for the search result
interface SlotHistory {
  slot_id: number;
  slots: {
    id: number;
    campaign_type: string;
    created_at: string;
    generated_by: string;
  };
}

interface SearchResult {
  contact: {
    id: number;
    phone_number: string;
    created_at: string;
  };
  history: SlotHistory[];
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  // 2. Use the interface instead of 'any'
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setHasSearched(true);
    setResult(null);

    // 1. Find the contact ID
    const { data: contact } = await supabase
        .from('contacts')
        .select('id, phone_number, created_at')
        .eq('phone_number', query.trim())
        .single();

    if (contact) {
        // 2. If found, find history (slots)
        // Note: We need to cast the joined data because Supabase types can be complex to infer automatically
        const { data: historyData } = await supabase
            .from('contact_slots')
            .select(`
                slot_id,
                slots (
                    id,
                    campaign_type,
                    created_at,
                    generated_by
                )
            `)
            .eq('contact_id', contact.id);
        
        // Safe casting to our defined interface
        const history = (historyData as unknown as SlotHistory[]) || [];
        
        setResult({ 
            contact: contact as SearchResult['contact'], 
            history 
        });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Global Number Search</h2>
        <p className="text-slate-500 mb-6">Track the lifecycle of any phone number in your database.</p>
        
        <div className="relative max-w-lg mx-auto">
            <input 
                type="text" 
                placeholder="Enter 10-digit number (e.g., 9876543210)"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-lg font-mono transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-4 top-5 text-slate-400 w-5 h-5" />
            <button 
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
                {loading ? 'Searching...' : 'Track'}
            </button>
        </div>
      </div>

      {/* Results Area */}
      {hasSearched && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                            <span className="font-bold text-emerald-800 text-lg">Number Found</span>
                        </div>
                        <span className="font-mono text-slate-600 bg-white px-3 py-1 rounded border border-emerald-200">
                            {result.contact.phone_number}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Status</h4>
                            {result.history.length > 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold flex items-center gap-2">
                                    <History className="w-5 h-5" /> USED / MARKETED
                                </div>
                            ) : (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> FRESH / UNUSED
                                </div>
                            )}
                            <div className="mt-4 text-sm text-slate-500">
                                <span className="block font-semibold">Added to DB:</span>
                                {new Date(result.contact.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Campaign History</h4>
                            {result.history.length === 0 ? (
                                <p className="text-slate-400 italic text-sm">No campaign history yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {result.history.map((h, i) => (
                                        <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                                            <div>
                                                <span className="font-bold text-indigo-600">Slot #{h.slots.id}</span>
                                                <span className="ml-2 text-slate-500 text-xs">({h.slots.campaign_type})</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(h.slots.created_at).toLocaleDateString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-xl border border-rose-100 shadow-sm text-center">
                    <div className="inline-flex p-3 bg-rose-50 rounded-full mb-4">
                        <XCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-rose-900 mb-1">Number Not Found</h3>
                    <p className="text-rose-600/80">This number does not exist in your database.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}