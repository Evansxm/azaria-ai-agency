import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Cpu, Globe, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Layout from '../components/Layout';
import NodeEngine from '../components/canvas/NodeEngine';
import { fetchServiceManifest } from '../lib/worker-api';



const metrics = [
  { label: 'Edge Locations', value: '330+', icon: Globe, color: '#54a0ff' },
  { label: 'Avg Response', value: '<28ms', icon: Cpu, color: '#00d68f' },
  { label: 'Uptime SLA', value: '99.99%', icon: Shield, color: '#ffaa00' },
];

const features = [
  {
    title: 'MCP Pipeline Engine',
    desc: 'Deploy Model Context Protocol servers on Cloudflare\'s global edge network with sub-30ms latency.',
    icon: Brain,
  },
  {
    title: 'AI Automation Stack',
    desc: 'Orchestrate Claude, GPT, and custom LLM agents through a unified JSON-RPC middleware layer.',
    icon: Cpu,
  },
  {
    title: 'Edge Security Layer',
    desc: 'SHA-256 PII hashing, POPIA compliance, leaky-bucket rate limiting, and bearer token auth.',
    icon: Shield,
  },
];

export default function HomePage() {
  const [manifest, setManifest] = useState(null);

  useEffect(() => {
    fetchServiceManifest().then(setManifest).catch(() => {});
  }, []);

  return (
    <Layout>
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <NodeEngine />

        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: 720,
          padding: '0 var(--space-6)',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
              marginBottom: 'var(--space-6)',
            }}>
              <Brain size={14} />
              <span>Now live on Cloudflare Global Edge</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 'var(--space-5)',
              letterSpacing: '-0.02em',
            }}>
              Enterprise AI{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-info))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Infrastructure
              </span>
              {' '}for the Edge
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto var(--space-8)',
            }}>
              Azaria AI deploys and manages Model Context Protocol servers on Cloudflare&apos;s global network — delivering sub-30ms AI tool execution, POPIA-compliant data handling, and enterprise-grade automation.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/services" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}>
                Explore Services <ArrowRight size={16} />
              </Link>
              <a
                href={manifest?.worker_url || 'https://azaria-ai-worker.evansmathibe82.workers.dev'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                Live Worker Status
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, zIndex: 2 }}
        >
          <ChevronDown size={24} color="var(--color-text-muted)" />
        </motion.div>
      </section>

      <section style={{ padding: 'var(--space-20) var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-16)',
          }}
        >
          {metrics.map((m) => {
            const MetricIcon = m.icon;
            return (
            <div key={m.label} style={{
              textAlign: 'center',
              padding: 'var(--space-6)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <MetricIcon size={28} color={m.color} style={{ marginBottom: 'var(--space-3)' }} />
              <div style={{ fontSize: '2rem', fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{m.label}</div>
            </div>
            );
          })}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-10)' }}
        >
          Core Capabilities
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-5)',
        }}>
          {features.map((f, i) => {
            const FeatureIcon = f.icon;
            return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: 'var(--space-6)',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <FeatureIcon size={22} color="var(--color-accent)" />
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
            );
          })}
        </div>
      </section>

      <section style={{
        padding: 'var(--space-16) var(--space-6)',
        textAlign: 'center',
        borderTop: '1px solid var(--color-glass-border)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            Backend Edge Engine
          </p>
          <a
            href="https://azaria-ai-worker.evansmathibe82.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
          >
            https://azaria-ai-worker.evansmathibe82.workers.dev
          </a>
        </motion.div>
      </section>
    </Layout>
  );
}
