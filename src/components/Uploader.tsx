'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function Uploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<{ phone: string }>(ws, { header: ['phone'] });

      const formattedData = data.slice(1).map(row => ({
        phone_number: String(row.phone).trim(),
        status: 'Unused'
      }));

      const { error: upsertError } = await supabase
          .from('contacts')
          .upsert(formattedData, { onConflict: 'phone_number', ignoreDuplicates: true });

      setLoading(false);
      if (!upsertError) {
        onUploadComplete();
      } else {
        alert('Error uploading data');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="mb-8">
       <div className="relative group cursor-pointer">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-colors duration-300 p-8 flex flex-col items-center justify-center text-center">
            
            {loading ? (
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            ) : (
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-3" />
            )}
            
            <h3 className="text-lg font-semibold text-slate-700">
                {loading ? 'Processing File...' : 'Upload Excel Sheet'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Drag and drop your .xlsx or .csv file here, or click to browse.
            </p>
            
            <input 
                type="file" 
                accept=".xlsx, .csv" 
                onChange={handleFileUpload}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
      </div>
    </div>
  );
}