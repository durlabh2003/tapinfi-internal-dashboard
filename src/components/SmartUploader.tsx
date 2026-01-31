'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Copy } from 'lucide-react';

// 1. Define Strict Types
interface UploadReport {
  total: number;
  success: number;
  duplicates: number; // <--- NEW FIELD
  failed: number;
  failedList: string[];
}

interface ExcelRow {
  Contact_Number?: string | number;
}

export default function SmartUploader({ onRefresh }: { onRefresh: () => void }) {
  const [report, setReport] = useState<UploadReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setReport(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const bstr = event.target?.result;
      if (typeof bstr !== 'string') return;

      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json<ExcelRow>(wb.Sheets[wsname]);

      const validNumbers: string[] = [];
      const failedNumbers: string[] = [];

      // Step 1: Validate Formats locally
      data.forEach((row) => {
        const rawVal = row.Contact_Number !== undefined ? String(row.Contact_Number) : '';
        const raw = rawVal.trim().replace(/\D/g, ''); 

        if (raw.length === 10) {
          validNumbers.push(raw);
        } else {
          failedNumbers.push(rawVal || 'Empty Row');
        }
      });

      // Step 2: Check & Insert in Chunks (To track Duplicates)
      let totalAdded = 0;
      let totalDuplicates = 0;
      const chunkSize = 1000;

      for (let i = 0; i < validNumbers.length; i += chunkSize) {
        const chunk = validNumbers.slice(i, i + chunkSize);
        
        // A. Check which of these ALREADY exist in DB
        const { data: existing } = await supabase
          .from('contacts')
          .select('phone_number')
          .in('phone_number', chunk);

        const existingSet = new Set(existing?.map(x => x.phone_number) || []);
        
        // B. Filter out the duplicates
        const newContacts = chunk.filter(num => !existingSet.has(num));
        
        // C. Update counters
        totalDuplicates += existingSet.size;
        totalAdded += newContacts.length;

        // D. Insert only the NEW ones
        if (newContacts.length > 0) {
          const insertPayload = newContacts.map(p => ({ phone_number: p }));
          await supabase.from('contacts').insert(insertPayload);
        }
      }

      // Step 3: Final Report
      setReport({
        total: data.length,
        success: totalAdded,
        duplicates: totalDuplicates, // <--- SAVED HERE
        failed: failedNumbers.length,
        failedList: failedNumbers
      });

      setLoading(false);
      onRefresh(); // Refresh the main dashboard stats
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-slate-100">
      <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
        <FileSpreadsheet className="text-emerald-400" /> Bulk Import
      </h2>

      {!report ? (
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center hover:bg-slate-800/50 transition cursor-pointer group">
            <input type="file" accept=".xlsx,.csv" onChange={handleUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                {loading ? (
                    <div className="animate-spin h-10 w-10 border-4 border-emerald-500 rounded-full border-t-transparent mb-4"/> 
                ) : (
                    <UploadCloud className="h-12 w-12 text-slate-500 group-hover:text-emerald-400 transition-colors mb-4" />
                )}
                <span className="text-lg font-bold text-slate-300">
                    {loading ? 'Analyzing Data...' : 'Click to Upload Excel'}
                </span>
                <p className="text-sm text-slate-500 mt-2">Column header must be <b>Contact_Number</b></p>
            </label>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            
            {/* 4-Grid Stats Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {/* 1. Total */}
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Rows</div>
                    <div className="text-2xl font-black text-white">{report.total}</div>
                </div>

                {/* 2. Success */}
                <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                    <div className="text-xs font-bold text-emerald-400 uppercase mb-1 flex justify-center items-center gap-1">
                         <CheckCircle2 size={12}/> Added
                    </div>
                    <div className="text-2xl font-black text-emerald-400">{report.success}</div>
                </div>

                {/* 3. Duplicates (NEW) */}
                <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
                    <div className="text-xs font-bold text-amber-400 uppercase mb-1 flex justify-center items-center gap-1">
                         <Copy size={12}/> Duplicate
                    </div>
                    <div className="text-2xl font-black text-amber-400">{report.duplicates}</div>
                </div>

                {/* 4. Failed */}
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                    <div className="text-xs font-bold text-red-400 uppercase mb-1 flex justify-center items-center gap-1">
                         <XCircle size={12}/> Failed
                    </div>
                    <div className="text-2xl font-black text-red-400">{report.failed}</div>
                </div>
            </div>
            
            {/* Failed List Details */}
            {report.failedList.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-lg border border-red-900/50">
                    <p className="font-bold text-red-400 mb-2 text-sm flex items-center gap-2">
                        <AlertCircle size={14}/> Invalid Format List (Non-10 digits)
                    </p>
                    <div className="max-h-32 overflow-y-auto font-mono text-xs text-red-300 space-y-1">
                        {report.failedList.map((n, i) => (
                            <div key={i}>{n}</div>
                        ))}
                    </div>
                </div>
            )}

            <button onClick={() => setReport(null)} className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition">
                Upload Another File
            </button>
        </div>
      )}
    </div>
  );
}