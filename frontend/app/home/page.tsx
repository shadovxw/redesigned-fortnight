"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Mic, Calendar, Clock, LogOut, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { meetingsApi, Meeting } from '@/lib/api';

export default function HomePage() {
    const { loading, logout } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loadingMeetings, setLoadingMeetings] = useState(true);

    // Fetch meetings from API
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const { data } = await meetingsApi.getAll();
                setMeetings(data.meetings || []);
            } catch (err) {
                console.error('Failed to fetch meetings:', err);
            } finally {
                setLoadingMeetings(false);
            }
        };

        if (!loading) {
            fetchMeetings();
        }
    }, [loading]);

    // Create new meeting
    const handleNewMeeting = async () => {
        try {
            const { data } = await meetingsApi.create('New Meeting');
            router.push(`/notes/${data.id}`);
        } catch (err) {
            console.error('Failed to create meeting:', err);
        }
    };

    // Delete meeting
    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Delete this meeting?')) return;

        try {
            await meetingsApi.delete(id);
            setMeetings(meetings.filter(m => m.id !== id));
        } catch (err) {
            console.error('Failed to delete meeting:', err);
        }
    };

    if (loading || loadingMeetings) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return 'New';
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg">ECHO</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Welcome Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Meetings</h1>
                    <p className="text-slate-500">All your transcribed meetings and notes in one place.</p>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search meetings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    {/* New Meeting Button */}
                    <button
                        onClick={handleNewMeeting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-5 h-5" />
                        New Meeting
                    </button>
                </div>

                {/* Meetings Grid */}
                <div className="grid gap-4">
                    {filteredMeetings.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mic className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No meetings found</h3>
                            <p className="text-slate-500 mb-6">Start your first meeting or try a different search.</p>
                            <button
                                onClick={handleNewMeeting}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Start Meeting
                            </button>
                        </div>
                    ) : (
                        filteredMeetings.map((meeting) => (
                            <Link
                                key={meeting.id}
                                href={`/notes/${meeting.id}`}
                                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {meeting.title}
                                            </h3>
                                            {meeting.is_recording && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse">
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                            {meeting.transcript?.slice(0, 150) || meeting.notes?.slice(0, 150) || 'No content yet...'}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(meeting.created_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDuration(meeting.duration_seconds)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(meeting.id, e)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

