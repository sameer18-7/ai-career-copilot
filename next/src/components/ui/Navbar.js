'use client';

import { Building2, GraduationCap, School, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/company', label: 'Business Portal', icon: Building2, color: 'from-indigo-500 to-purple-500' },
    { href: '/student', label: 'Students Portal', icon: GraduationCap, color: 'from-purple-500 to-pink-500' },
    { href: '/college', label: 'Working Professionals', icon: School, color: 'from-violet-500 to-indigo-500' },
];

export default function Navbar() {
    const pathname = usePathname();

    if (pathname.startsWith('/student')) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            <span className="gradient-text">linker.intel</span>
                            <span className="text-slate-500 font-normal text-sm ml-1.5">AI</span>
                        </span>
                    </Link>

                    {/* Nav Tabs */}
                    <div className="flex items-center gap-1 rounded-2xl bg-slate-800/50 p-1 border border-slate-700/50">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (pathname === '/' && item.href === '/company');
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300
                    ${isActive
                                            ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400">AI Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
