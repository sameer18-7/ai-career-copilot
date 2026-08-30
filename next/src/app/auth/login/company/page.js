'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CompanyLogin() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'company' }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed');
            }
            const result = await signIn('credentials', { email, password, redirect: false });
            if (result?.error) throw new Error('Invalid email or password');
            router.push('/company');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(240,242,245,0.35)), url(/backgrounds/portal-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat' }}>
            <div className="w-full max-w-[440px] mx-4">
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-3">
                        <div className="bg-[#1a1a1a] p-2.5 rounded-lg">
                            <span className="material-symbols-outlined text-white text-2xl">grid_view</span>
                        </div>
                        <span className="text-[24px] font-bold tracking-tight text-gray-900">Placify</span>
                    </a>
                </div>

                <div className="rounded-[20px] p-8 border border-white/50 shadow-lg" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-indigo-600 text-xl">business</span>
                        </div>
                        <span className="text-[15px] font-bold text-gray-900">Company / HR Portal</span>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-[14px] border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>{error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Company Name</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">apartment</span>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-400" placeholder="Company name" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-400" placeholder="hr@company.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-400" placeholder="••••••" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-[16px] font-semibold transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? (
                                <><span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>Processing...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[20px]">{isSignUp ? 'person_add' : 'login'}</span>{isSignUp ? 'Create Account' : 'Sign In'}</>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-5 text-[14px] text-gray-500">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-indigo-600 font-semibold hover:underline">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>

                <div className="mt-6 flex justify-center gap-4 text-[13px]">
                    <a href="/auth/login/student" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">school</span>Student
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="/auth/login/college" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">account_balance</span>College
                    </a>
                </div>
            </div>
        </div>
    );
}
