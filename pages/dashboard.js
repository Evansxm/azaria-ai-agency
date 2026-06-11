import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import DashboardPanel from '../components/DashboardPanel';

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <Layout>
      <section style={{
        padding: 'var(--space-16) var(--space-6) var(--space-20)',
        maxWidth: 900,
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
            Premium{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-info))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Control Panel
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 540 }}>
            Manage your API tokens, monitor usage analytics in real time, and integrate Azaria AI with your Claude Desktop configuration.
          </p>
        </motion.div>

        <DashboardPanel
          authenticated={authenticated}
          onLogin={() => setAuthenticated(true)}
        />
      </section>
    </Layout>
  );
}
