import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import AdminWorkerDashboard from '../components/AdminWorkerDashboard';

export default function AdminPage() {
  const [token, setToken] = useState('');

  return (
    <Layout>
      <section style={{
        padding: 'var(--space-16) var(--space-6) var(--space-20)',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <h1 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.02em',
          }}>
            Admin{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-info))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Dashboard
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 540 }}>
            Manage edge worker configuration, monitor live telemetry, and update credentials for the Evans Mathibe AI platform.
          </p>
        </motion.div>

        {!token && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-10)',
              textAlign: 'center',
              maxWidth: 480,
              margin: '0 auto var(--space-8)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Enter Admin Token
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Paste your Master Admin bearer token to unlock the worker control panel.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 380, margin: '0 auto' }}>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="azr_sk_..."
                style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                onClick={() => {}}
                disabled={!token.startsWith('azr_sk_')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-sm)',
                  background: token.startsWith('azr_sk_') ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                  color: token.startsWith('azr_sk_') ? 'white' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: token.startsWith('azr_sk_') ? 'pointer' : 'not-allowed',
                }}
              >
                Unlock Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {token && <AdminWorkerDashboard token={token} />}
      </section>
    </Layout>
  );
}
