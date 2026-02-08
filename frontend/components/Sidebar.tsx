"use client";
import { Plus, Home, FileText, Settings, Search, Clock, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { meetingsApi, Meeting } from '@/lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const { data } = await meetingsApi.getAll();
      setMeetings((data.meetings || []).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      console.error('Failed to fetch sidebar meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Poll every 5 seconds to keep sidebar updated (simple solution for now)
    const interval = setInterval(fetchMeetings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNewMeeting = async () => {
    try {
      const { data } = await meetingsApi.create('Untitled Meeting');
      router.push(`/notes/${data.id}`);
      fetchMeetings(); // Refresh list immediately
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  const navItems = [
    { name: 'Home', icon: Home, href: '/home' },
    { name: 'Recent', icon: Clock, href: '/recent' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const filteredMeetings = meetings; // Can add search filter later if needed

  return (
    <aside className="w-64 border-r border-slate-100 bg-white h-screen flex flex-col fixed left-0 z-40">
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Link href="/home" className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 border border-slate-800">
            <Image src="/echo-icon.png" alt="E" width={22} height={22} className="opacity-90" />
          </Link>
          <span className="font-bold text-xl tracking-tight text-slate-900">Echo</span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="px-4 mb-6">
        <button
          onClick={handleNewMeeting}
          className="w-full group flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="relative mb-4 px-2">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-8 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Recent Notes
        </div>

        <div className="space-y-0.5">
          {filteredMeetings.slice(0, 10).map((meeting) => {
            const isActive = pathname === `/notes/${meeting.id}`;
            return (
              <Link
                key={meeting.id}
                href={`/notes/${meeting.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm group transition-colors ${isActive ? 'bg-white shadow-sm ring-1 ring-slate-200 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full transition-transform ${isActive ? 'bg-indigo-500 scale-110' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                <span className="truncate font-medium">{meeting.title || 'Untitled Meeting'}</span>
              </Link>
            )
          })}

          {meetings.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
              No notes found.
            </div>
          )}
        </div>
      </nav>

      {/* User / Profile Footer */}
      <div className="p-4 border-t border-slate-50">
        <button className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-all group">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center border border-white shadow-sm overflow-hidden">
            {/* Replace with user avatar if available */}
            <span className="text-indigo-700 font-bold text-xs">VW</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-slate-900 leading-none">Vrishank</p>
            <p className="text-[10px] text-slate-400 mt-1">Personal Pro</p>
          </div>
          <LogOut size={16} className="text-slate-300 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </aside>
  );
}