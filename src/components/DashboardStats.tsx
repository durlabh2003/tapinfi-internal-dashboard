import { Database, CheckCircle, Clock } from 'lucide-react';

export default function DashboardStats({ total, used, unused }: { total: number, used: number, unused: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Contacts Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Database</h3>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-4xl font-extrabold text-slate-900">{total.toLocaleString()}</p>
        <p className="text-xs text-slate-400 mt-2">All uploaded numbers</p>
      </div>

      {/* Used Contacts Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Marketed</h3>
          <div className="p-2 bg-rose-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>
        <p className="text-4xl font-extrabold text-slate-900">{used.toLocaleString()}</p>
        <p className="text-xs text-slate-400 mt-2">Already processed</p>
      </div>

      {/* Unused Contacts Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Fresh Leads</h3>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <p className="text-4xl font-extrabold text-emerald-600">{unused.toLocaleString()}</p>
        <p className="text-xs text-slate-400 mt-2">Available for campaigns</p>
      </div>
    </div>
  );
}