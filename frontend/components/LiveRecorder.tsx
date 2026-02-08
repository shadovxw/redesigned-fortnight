"use client";
import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface LiveRecorderProps {
    onTranscriptionChunk?: (text: string) => void;
}

export default function LiveRecorder({ onTranscriptionChunk }: LiveRecorderProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const isRecordingRef = useRef<boolean>(false);
    const [error, setError] = useState<string>('');

    // Keep latest callback in ref to avoid stale closures in event listener
    const onChunkRef = useRef(onTranscriptionChunk);

    // Update ref when prop changes
    if (onChunkRef.current !== onTranscriptionChunk) {
        onChunkRef.current = onTranscriptionChunk;
    }

    const startStreaming = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isRecordingRef.current = true;
            setStatus('recording');

            // Function to handle the recording cycle
            const processSegment = () => {
                if (!isRecordingRef.current) return;

                // Create a fresh recorder for each segment
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = async (e) => {
                    if (e.data.size === 0) return;
                    console.log(`🎤 Chunk captured: ${e.data.size} bytes`);

                    const formData = new FormData();
                    formData.append('audio', e.data, `chunk-${Date.now()}.webm`);

                    try {
                        const token = localStorage.getItem('echo_token');
                        const response = await fetch('/api/live-chunk', {
                            method: 'POST',
                            body: formData,
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            console.log('📝 Transcribed:', data.text);
                            if (onChunkRef.current && data.text) {
                                onChunkRef.current(data.text);
                            }
                        }
                    } catch (err) {
                        console.error('Upload error:', err);
                    }
                };

                recorder.onstop = () => {
                    if (isRecordingRef.current) {
                        // Recursively start the next segment
                        processSegment();
                    }
                };

                recorder.start();

                // Stop this segment after 5 seconds to trigger dataavailable + onstop
                setTimeout(() => {
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                }, 10000); // 10 seconds per chunk for better context
            };

            processSegment();

        } catch (err) {
            console.error('Microphone error:', err);
            setError('Microphone access denied');
            setStatus('idle');
        }
    };

    const stopStreaming = () => {
        isRecordingRef.current = false;

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        // Stop the actual media stream tracks
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
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