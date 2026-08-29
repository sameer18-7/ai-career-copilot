import { Search, Bell, Globe, ChevronDown, Menu } from 'lucide-react';

export default function TopBar({ onMenuClick }) {
  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-bg-light transition-colors"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} className="text-gray-600" />
        </button>
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2.5 w-64 rounded-xl bg-bg-light border-none text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-blue/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Language */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-light text-sm text-gray-600 transition-colors" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Globe size={16} />
          <span>EN</span>
          <ChevronDown size={14} />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-bg-light transition-colors" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Notifications">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ width: '18px', height: '18px', fontSize: '10px' }}>
            3
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block" />

        {/* Profile */}
        <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-bg-light transition-colors" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white font-bold text-sm">
            SK
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-navy leading-tight">Saksham K.</p>
            <p className="text-xs text-gray-400 leading-tight">Student</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
