import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: 64 }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid var(--color-glass-border)',
        padding: 'var(--space-8) var(--space-6)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.8rem',
      }}>
        <p>&copy; {new Date().getFullYear()} Azaria AI Agency. All rights reserved.</p>
        <p style={{ marginTop: 'var(--space-2)' }}>
          Built with precision on Cloudflare&apos;s global edge network.
        </p>
      </footer>
    </>
  );
}
