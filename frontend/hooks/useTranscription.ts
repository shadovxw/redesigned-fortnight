"use client";
import { useState, useEffect, useCallback } from 'react';

export interface TranscriptionChunk {
  text: string;
  timestamp: number;
}

export function useTranscription() {
  const [transcript, setTranscript] = useState<string>('');
  const [lastChunk, setLastChunk] = useState<TranscriptionChunk | null>(null);

  const appendChunk = useCallback((chunk: string) => {
    if (!chunk || chunk.trim() === '') return;
    
    setLastChunk({ text: chunk, timestamp: Date.now() });
    setTranscript(prev => {
      // Add space if previous text doesn't end with punctuation or space
      const needsSpace = prev && !/[\s.!?]$/.test(prev);
      return prev + (needsSpace ? ' ' : '') + chunk.trim();
    });
  }, []);

  const clearTranscript = () => {
    setTranscript('');
    setLastChunk(null);
  };

  return { 
    transcript, 
    lastChunk,
    appendChunk, 
    clearTranscript 
  };
}
