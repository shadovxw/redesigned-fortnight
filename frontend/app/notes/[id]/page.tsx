"use client";
import Sidebar from '@/components/Sidebar';
import TiptapEditor from '@/components/TiptapEditor';
import LiveRecorder from '@/components/LiveRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { useAuth } from '@/hooks/useAuth';

export default function NotePage() {
    const { transcript, lastChunk, appendChunk } = useTranscription();
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-slate-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                {/* Toolbar for the current note */}
                <header className="h-14 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 bg-white z-10">
                    <span className="text-slate-400 text-sm">
                        {lastChunk && <span className="text-green-600 mr-2">● Live</span>}
                        Last saved: 2 mins ago
                    </span>
                    <LiveRecorder onTranscriptionChunk={appendChunk} />
                </header>

                {/* The Workspace */}
                <div className="flex-1 overflow-y-auto pt-16 pb-32 px-12 lg:px-24">
                    <div className="max-w-3xl mx-auto">
                        <input
                            type="text"
                            defaultValue="Untitled Meeting"
                            className="w-full text-5xl font-bold outline-none mb-10 placeholder:text-slate-200 text-slate-900"
                        />
                        <TiptapEditor liveTranscript={lastChunk} />
                    </div>
                </div>
            </div>
        </div>
    );
}