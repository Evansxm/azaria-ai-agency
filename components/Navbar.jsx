import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Brain, Terminal, CreditCard, LayoutDashboard } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Brain },
  { href: '/services', label: 'Services', icon: Terminal },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 var(--space-6)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: scrolled
          ? 'rgba(10, 10, 15, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-glass-border)' : '1px solid transparent',
        transition: 'all var(--transition-base)',
      }}
    >
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--color-text-primary)',
        }}>
          <Brain size={22} color="var(--color-accent)" />
          Azaria AI
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <div className="nav-desktop-links" style={{ display: 'flex', gap: 'var(--space-1)' }}>
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = router.pathname === href;
              return (
                <Link key={href} href={href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="nav-mobile-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              background: 'var(--color-surface-glass)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid var(--color-glass-border)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = router.pathname === href;
              return (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                }}>
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
