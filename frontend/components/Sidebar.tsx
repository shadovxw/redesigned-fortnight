import { Plus, Home, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white h-screen p-6 flex flex-col fixed left-0">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
        <span className="font-bold text-xl tracking-tight">Echo</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
          <Home size={18} /> Home
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition-colors">
          <Plus size={18} /> New Note
        </button>
        <div className="pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase">Recent Pages</div>
        {/* We will map over a list of notes here later */}
        <Link href="/notes/1" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm">
          <FileText size={16} /> Weekly Sync
        </Link>
      </nav>
    </aside>
  );
}