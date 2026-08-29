import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isMarketing = ['/', '/features', '/pricing'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (!isMarketing && location.pathname !== '/signup' && location.pathname !== '/login') return null;

  const navLinks = [
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/login', label: 'Login' },
  ];

  const navBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
    : 'bg-transparent';

  const textColor = scrolled || !isHome ? 'text-gray-700' : 'text-white/90';
  const logoColor = scrolled || !isHome ? 'text-royal-blue' : 'text-white';
  const hoverColor = scrolled || !isHome ? 'hover:text-royal-blue' : 'hover:text-white';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      style={{ height: '72px' }}
    >
      <div className="container flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className={`flex items-center gap-2 font-extrabold text-xl ${logoColor} no-underline`}>
          <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center">
            <Rocket size={20} className="text-white" />
          </div>
          <span>AI Career Copilot</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${textColor} ${hoverColor} ${
                location.pathname === link.to
                  ? (scrolled || !isHome ? 'text-royal-blue bg-blue-light/50' : 'text-white bg-white/15')
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/signup" className="btn btn-sm btn-white ml-3 no-underline" style={scrolled || !isHome ? { background: 'var(--color-royal-blue)', color: 'white', borderColor: 'var(--color-royal-blue)' } : {}}>
            Get Started Free
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${textColor}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 animate-fade-in-down">
          <div className="p-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-light/50 hover:text-royal-blue transition-colors no-underline ${
                  location.pathname === link.to ? 'bg-blue-light/50 text-royal-blue' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/signup" className="btn btn-primary mt-2 no-underline text-center">
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
