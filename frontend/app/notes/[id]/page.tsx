"use client";
import Sidebar from '@/components/Sidebar';
import TiptapEditor from '@/components/TiptapEditor';
import LiveRecorder from '@/components/LiveRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { meetingsApi, Meeting } from '@/lib/api';

export default function NotePage() {
    const { transcript, lastChunk, appendChunk } = useTranscription();
    const { loading: authLoading } = useAuth();
    const params = useParams();
    const id = Number(params.id);

    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');

    // Debounce refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch meeting data
    useEffect(() => {
        const fetchMeeting = async () => {
            if (!id) return;
            try {
                const { data } = await meetingsApi.getOne(id);
                setMeeting(data);
                setTitle(data.title || 'Untitled Meeting');
            } catch (err) {
                console.error('Failed to fetch meeting:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) fetchMeeting();
    }, [id, authLoading]);

    // Auto-save function
    const saveChanges = useCallback(async (updates: { title?: string; notes?: string }) => {
        setSaving(true);
        try {
            await meetingsApi.update(id, updates);
        } catch (err) {
            console.error('Failed to save changes:', err);
        } finally {
            // fast fake "saved" state for UX, realistic delay would be fine too
            setTimeout(() => setSaving(false), 500);
        }
    }, [id]);

    // Debounced update handler
    const handleContentUpdate = (newContent: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            saveChanges({ notes: newContent });
        }, 2000); // Auto-save after 2 seconds of inactivity
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            saveChanges({ title: newTitle });
        }, 1000);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm font-medium">Loading note...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                {/* Toolbar for the current note */}
                <header className="h-14 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-sm z-10 transition-all">
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-2">
                        {saving ? (
                            <span className="text-indigo-500 animate-pulse">Saving...</span>
                        ) : (
                            <span className="text-slate-300">Saved</span>
                        )}
                        {lastChunk && <span className="text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>}
                    </span>
                    <LiveRecorder onTranscriptionChunk={appendChunk} />
                </header>

                {/* The Workspace */}
                <div className="flex-1 overflow-y-auto pt-16 pb-32 px-12 lg:px-24">
                    <div className="max-w-3xl mx-auto">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Untitled Meeting"
                            className="w-full text-4xl lg:text-5xl font-bold outline-none mb-8 placeholder:text-slate-200 text-slate-800 bg-transparent"
                        />
                        {/* Only render editor if we have initial content or if it's empty but loaded */}
                        <TiptapEditor
                            liveTranscript={lastChunk}
                            initialContent={meeting?.notes || ''}
                            onUpdate={handleContentUpdate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}