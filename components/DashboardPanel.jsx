import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Terminal, Copy, Check, BarChart3, Clock, Activity } from 'lucide-react';

const MOCK_TOKEN = 'azr_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';

const MOCK_USAGE = [
  { label: 'Today', calls: 142, limit: 500 },
  { label: 'This Week', calls: 843, limit: 3500 },
  { label: 'This Month', calls: 3241, limit: 15000 },
];

const CLAUDE_CONFIG = {
  mcpServers: {
    'azaria-ai': {
      command: 'npx',
      args: ['-y', '@azaria-ai/mcp-server'],
      env: {
        AZARIA_API_KEY: '<YOUR_API_KEY>',
      },
    },
  },
};

export default function DashboardPanel({ authenticated, onLogin }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  function copyToClipboard(text, setter) {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  }

  if (!authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-12)',
          textAlign: 'center',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <Key size={48} color="var(--color-accent)" style={{ marginBottom: 'var(--space-4)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Authenticate Your Session
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
          Enter your Premium API token to access the dashboard, view usage analytics, and manage your account.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 360, margin: '0 auto' }}>
          <input
            type="password"
            placeholder="Paste your API token..."
            style={{ textAlign: 'center', fontSize: '0.85rem' }}
          />
          <button
            onClick={onLogin}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Authenticate
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Don&apos;t have a token? Subscribe to the Premium plan to receive one.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Premium Dashboard</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <Activity size={20} color="var(--color-accent)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status</div>
            <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Active</div>
          </div>
        </div>
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <Clock size={20} color="var(--color-info)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Plan</div>
            <div style={{ fontWeight: 600 }}>Premium MCP Pipeline</div>
          </div>
        </div>
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <BarChart3 size={20} color="var(--color-warning)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Calls Today</div>
            <div style={{ fontWeight: 600 }}>{MOCK_USAGE[0].calls.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}>
        <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Key size={18} color="var(--color-accent)" />
          API Key Management
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3) var(--space-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          marginBottom: 'var(--space-4)',
        }}>
          <span>{MOCK_TOKEN.slice(0, 20)}...{MOCK_TOKEN.slice(-6)}</span>
          <button
            onClick={() => copyToClipboard(MOCK_TOKEN, setCopiedKey)}
            style={{
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {copiedKey ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
          </button>
        </div>

        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
          Usage Analytics
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {MOCK_USAGE.map((item) => (
            <div key={item.label}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginBottom: 'var(--space-1)',
              }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                <span style={{ fontWeight: 600 }}>
                  {item.calls.toLocaleString()} / {item.limit.toLocaleString()}
                </span>
              </div>
              <div style={{
                height: 6,
                background: 'var(--color-bg-elevated)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((item.calls / item.limit) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, var(--color-accent), var(--color-info))',
                  borderRadius: 3,
                  transition: 'width var(--transition-base)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}>
        <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Terminal size={18} color="var(--color-accent)" />
          Integration — Claude Desktop Config
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
          Add this snippet to your <code style={{ color: 'var(--color-accent)' }}>claude_desktop_config.json</code>:
        </p>
        <div style={{
          position: 'relative',
          background: '#06060a',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          lineHeight: 1.6,
          overflowX: 'auto',
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{JSON.stringify(CLAUDE_CONFIG, null, 2)}
          </pre>
          <button
            onClick={() => copyToClipboard(JSON.stringify(CLAUDE_CONFIG, null, 2), setCopiedConfig)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {copiedConfig ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
