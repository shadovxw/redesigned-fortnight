"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Mic, Sparkles, CheckSquare, ArrowRight, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Image src="/echo-icon.png" alt="E" width={20} height={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">ECHO</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[40%] h-[60%] bg-indigo-100/40 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[50%] bg-purple-100/30 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-widest text-slate-500">Developed by shadovxw - for internal use only</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-8">
            Meetings, <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Automagically Summarized.
            </span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
            ECHO transcribes your voice in real-time and uses Gemini AI to turn messy thoughts into structured, beautiful notes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* <Link
              href="/login"
              className="group w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </Link> */}
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
          
          {/* Main Feature - Transcription */}
          <div className="md:col-span-8 md:row-span-2 bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mic size={180} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                <Mic className="text-white h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Live Whisper Transcription</h3>
              <p className="text-slate-500 text-lg max-w-md">
                Powered by Groq's LPU™ technology for near-zero latency. Your words appear on screen as fast as you think them.
              </p>
            </div>
          </div>

          {/* AI Beautify */}
          <div className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[32px] p-8 text-white group hover:scale-[1.02] transition-transform shadow-xl shadow-indigo-200">
            <Sparkles className="h-8 w-8 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2">AI Beautify</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              One click to fix grammar, remove filler words, and polish your rough notes into a professional report.
            </p>
          </div>

          {/* Task Extraction */}
          <div className="md:col-span-4 md:row-span-1 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckSquare size={20} />
              </div>
              <h3 className="font-bold">Action Items</h3>
            </div>
            <p className="text-slate-500 text-sm">
              Automatically scans transcripts to list next steps, assignees, and deadlines.
            </p>
          </div>

          {/* Built With (Small Footer Bento) */}
          <div className="md:col-span-4 md:row-span-1 bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between">
            <Cpu className="text-indigo-400 h-6 w-6" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Internal Tech</p>
              <p className="text-sm font-medium">Next.js + Go + Gemini 1.5 Pro</p>
            </div>
          </div>

          {/* Security Bento */}
          <div className="md:col-span-8 md:row-span-1 bg-indigo-50 rounded-[32px] p-10 flex items-center gap-8 border border-indigo-100/50 group">
             <div className="hidden sm:flex w-20 h-20 bg-white rounded-2xl items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <ShieldCheck className="text-indigo-600 h-10 w-10" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-indigo-900 mb-1">Your data, your eyes only.</h3>
                <p className="text-indigo-700/70 text-sm">
                  This is a private instance. All recordings and transcripts are encrypted and stored locally on your secure server.
                </p>
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 Echo Project • Personal Use License
          </p>
          <div className="flex gap-6">
            <span className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer text-xs font-bold uppercase">Privacy</span>
            <span className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer text-xs font-bold uppercase">Terms</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s linear infinite;
        }
      `}</style>
    </div>
  );
}