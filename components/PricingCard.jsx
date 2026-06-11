import { motion } from 'framer-motion';
import { Check, Zap, Server, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Public Playground',
    price: '$0',
    period: 'forever',
    icon: Zap,
    description: 'Explore the Azaria AI sandbox and test MCP tools live.',
    features: [
      'Full tool schema access',
      'Live sandbox terminal',
      'Rate-limited RPC calls',
      'Community support',
    ],
    cta: 'Get Started',
    accent: 'var(--color-info)',
  },
  {
    name: 'Premium MCP Pipeline',
    price: '$49',
    period: '/month',
    icon: Server,
    description: 'Unlimited production MCP access with dedicated API keys.',
    features: [
      'Unlimited RPC calls',
      'Dedicated API token',
      'Usage analytics dashboard',
      'Priority support',
      'Early feature access',
      'Custom integrations',
    ],
    cta: 'Subscribe Now',
    accent: 'var(--color-accent)',
    featured: true,
  },
  {
    name: 'On-Prem Enterprise',
    price: 'Bespoke',
    period: '',
    icon: Building2,
    description: 'Self-hosted Azaria AI infrastructure for your organization.',
    features: [
      'Private worker deployment',
      'Custom domain & SSL',
      'Unlimited seats',
      'SLA guarantees',
      'Dedicated engineer',
      'Code audit & compliance',
      '24/7 phone support',
    ],
    cta: 'Contact Sales',
    accent: 'var(--color-success)',
  },
];

export default function PricingCard({ plan, index }) {
  const p = plans.find((x) => x.name === plan) || plans[0];
  const Icon = p.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        background: p.featured
          ? 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(84,160,255,0.08))'
          : 'var(--color-bg-card)',
        border: p.featured
          ? '1px solid var(--color-accent)'
          : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        boxShadow: p.featured ? 'var(--depth-shadow-accent)' : 'var(--depth-shadow-md)',
        overflow: 'hidden',
      }}
    >
      {p.featured && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: -32,
          background: 'var(--color-accent)',
          color: 'white',
          padding: '4px 40px',
          fontSize: '0.75rem',
          fontWeight: 600,
          transform: 'rotate(45deg)',
        }}>
          POPULAR
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: `${p.accent}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={22} color={p.accent} />
        </div>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.name}</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{p.price}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{p.period}</span>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {p.description}
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        flex: 1,
      }}>
        {p.features.map((f, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
          }}>
            <Check size={14} color={p.accent} />
            {f}
          </div>
        ))}
      </div>

      <button style={{
        padding: '12px 24px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        fontSize: '0.9rem',
        background: p.featured ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
        color: p.featured ? 'white' : 'var(--color-text-primary)',
        border: p.featured ? 'none' : '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}>
        {p.cta}
      </button>
    </motion.div>
  );
}

export { plans };
