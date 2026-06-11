import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import PricingCard from '../components/PricingCard';
import SandboxTerminal from '../components/Terminal';

export default function ServicesPage() {
  return (
    <Layout>
      <section style={{
        padding: 'var(--space-16) var(--space-6) var(--space-10)',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'var(--color-accent-subtle)',
            border: '1px solid rgba(108, 92, 231, 0.2)',
            fontSize: '0.8rem',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-5)',
          }}>
            <Sparkles size={14} />
            <span>Pricing & Plans</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.02em',
          }}>
            Choose Your{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-info))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Infrastructure
            </span>{' '}
            Layer
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--color-text-secondary)',
            maxWidth: 600,
            margin: '0 auto var(--space-10)',
            lineHeight: 1.6,
          }}>
            From free public sandbox access to enterprise on-premise deployments — scale your AI operations with Azaria AI.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-16)',
        }}>
          <PricingCard plan="Public Playground" index={0} />
          <PricingCard plan="Premium MCP Pipeline" index={1} />
          <PricingCard plan="On-Prem Enterprise" index={2} />
        </div>
      </section>

      <section style={{
        padding: 'var(--space-10) var(--space-6) var(--space-20)',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
          }}
        >
          Live Sandbox Playground
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            maxWidth: 600,
            margin: '0 auto var(--space-6)',
            lineHeight: 1.6,
          }}
        >
          Test the Azaria AI worker engine in real time. Enter a tool name below and see the JSON-RPC response rendered live.
        </motion.p>

        <SandboxTerminal />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Powered by{' '}
            <a
              href="https://azaria-ai-worker.evansmathibe82.workers.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
            >
              azaria-ai-worker.evansmathibe82.workers.dev
            </a>
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}
