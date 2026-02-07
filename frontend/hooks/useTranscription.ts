"use client";
import { useState, useEffect } from 'react';

export function useTranscription() {
  const [transcript, setTranscript] = useState<string>('');
  const [lastChunk, setLastChunk] = useState<string>('');

  const appendChunk = (chunk: string) => {
    if (!chunk || chunk.trim() === '') return;
    
    setLastChunk(chunk);
    setTranscript(prev => {
      // Add space if previous text doesn't end with punctuation or space
      const needsSpace = prev && !/[\s.!?]$/.test(prev);
      return prev + (needsSpace ? ' ' : '') + chunk.trim();
    });
  };

  const clearTranscript = () => {
    setTranscript('');
    setLastChunk('');
  };

  return { 
    transcript, 
    lastChunk,
    appendChunk, 
    clearTranscript 
  };
}
