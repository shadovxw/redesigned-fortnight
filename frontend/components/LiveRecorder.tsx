"use client";
import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface LiveRecorderProps {
    onTranscriptionChunk?: (text: string) => void;
}

export default function LiveRecorder({ onTranscriptionChunk }: LiveRecorderProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [error, setError] = useState<string>('');

    const startStreaming = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = async (e) => {
                if (e.data.size === 0) return;

                const formData = new FormData();
                formData.append('audio', e.data, `chunk-${Date.now()}.webm`);

                try {
                    // Get auth token
                    const token = localStorage.getItem('echo_token');

                    // Send chunk to backend with auth header
                    const response = await fetch('http://localhost:8080/live-chunk', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('📝 Transcribed:', data.text);

                        // Send to parent component
                        if (onTranscriptionChunk && data.text) {
                            onTranscriptionChunk(data.text);
                        }
                    } else {
                        console.error('Transcription failed:', await response.text());
                    }
                } catch (err) {
                    console.error('Network error:', err);
                    setError('Connection failed. Check if backend is running.');
                }
            };

            recorder.start(5000); // Send chunk every 5 seconds
            setStatus('recording');
        } catch (err) {
            console.error('Microphone error:', err);
            setError('Microphone access denied');
        }
    };

    const stopStreaming = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setStatus('idle');
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={status === 'recording' ? stopStreaming : startStreaming}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${status === 'recording'
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
            >
                {status === 'recording' ? (
                    <><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Stop Recording</>
                ) : (
                    <><Mic size={16} /> Start Live Meet</>
                )}
            </button>
            {error && (
                <span className="text-xs text-red-600">{error}</span>
            )}
        </div>
    );
}