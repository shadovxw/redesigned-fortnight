"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Mic, Calendar, Clock, LogOut, Search, 
  Trash2, MoreVertical, FileText, ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { meetingsApi, Meeting } from '@/lib/api';

export default function HomePage() {
    const { loading: authLoading, logout} = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch meetings
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const { data } = await meetingsApi.getAll();
                // Sort by newest first
                const sorted = (data.meetings || []).sort((a: Meeting, b: Meeting) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setMeetings(sorted);
            } catch (err) {
                console.error('Failed to fetch meetings:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) fetchMeetings();
    }, [authLoading]);

    // Actions
    const handleNewMeeting = async () => {
        try {
            const { data } = await meetingsApi.create('Untitled Meeting');
            router.push(`/notes/${data.id}`);
        } catch (err) {
            console.error('Failed to create:', err);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await meetingsApi.delete(id);
            setMeetings(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    // Helpers
    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* 1. Glass Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-900">ECHO</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Systems Operational
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                
                {/* 2. Hero / Welcome Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Good Morning, Vrishank.
                        </h1>
                        <p className="text-slate-500 text-lg">
                            You have <span className="font-semibold text-indigo-600">{meetings.length} meetings</span> recorded.
                        </p>
                    </div>
                    
                    <button
                        onClick={handleNewMeeting}
                        className="group flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>New Meeting</span>
                    </button>
                </div>

                {/* 3. Search & Filters */}
                <div className="mb-10 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search transcripts, titles, or dates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* 4. Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4" />
                                <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMeetings.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">No notes found</h3>
                                <p className="text-slate-500 mb-6">Create a new meeting to get started.</p>
                                <button onClick={handleNewMeeting} className="text-indigo-600 font-semibold hover:underline">
                                    Start recording now
                                </button>
                            </div>
                        ) : (
                            filteredMeetings.map((meeting, index) => (
                                <Link
                                    key={meeting.id}
                                    href={`/notes/${meeting.id}`}
                                    className="group relative bg-white rounded-3xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col h-[280px]"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {meeting.is_recording ? <Mic className="w-5 h-5 animate-pulse" /> : <FileText className="w-5 h-5" />}
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(meeting.id, e)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {meeting.title || 'Untitled Meeting'}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">
                                            {meeting.transcript || meeting.notes || "No content available. Click to start writing or recording..."}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-400 mt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {getTimeAgo(meeting.created_at)}
                                            </span>
                                            {meeting.duration_seconds > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {Math.floor(meeting.duration_seconds / 60)}m
                                                </span>
                                            )}
                                        </div>
                                        <span className="group-hover:translate-x-1 transition-transform text-indigo-500 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                            Open <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}