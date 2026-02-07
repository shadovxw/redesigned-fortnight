"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sparkles, Lock, User, ShieldCheck } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return setError('Please fill in all fields');


        setError('');
        setLoading(true);

        try {
            const { data } = await authApi.login(username, password);
            localStorage.setItem('echo_token', data.token);
            router.push('/home');
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('Invalid credentials. Please try again.');
            } else {
                setError('Unable to connect to the server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Soft Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="relative z-10 w-full max-w-[400px]">
                {/* Brand Header */}
                <div className="text-center mb-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
                    <div className="inline-block p-3 bg-white rounded-3xl shadow-xl shadow-indigo-100/50 mb-4 border border-slate-50">
                        <Image
                            src="/echo-icon.png" // Use an icon-only version here
                            alt="ECHO"
                            width={64}
                            height={64}
                            className="rounded-2xl"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                        ECHO
                    </h1>
                    <p className="text-slate-500 font-medium">Your meetings, summarized.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 border border-white">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                    Username
                                </label>
                                <div className="group relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                        placeholder="shadovxw"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                    Password
                                </label>
                                <div className="group relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <Sparkles className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Trust Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-medium tracking-wide uppercase">End-to-End Encrypted</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob { animation: blob 10s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            `}</style>
        </div>
    );
}