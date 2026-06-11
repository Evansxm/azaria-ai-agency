import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Send, RotateCcw, Copy, Check } from 'lucide-react';
import { rpcCall } from '../lib/worker-api';

export default function SandboxTerminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setOutput((prev) => [...prev, { type: 'input', text: `> rpc.call("${trimmed}")` }]);
    try {
      const result = await rpcCall(trimmed, {});
      setOutput((prev) => [...prev, { type: 'output', text: JSON.stringify(result, null, 2) }]);
    } catch (err) {
      setOutput((prev) => [...prev, { type: 'error', text: `Error: ${err.message}` }]);
    }
    setLoading(false);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearOutput() {
    setOutput([]);
  }

  function copyOutput() {
    const text = output.map((o) => o.text).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <TerminalIcon size={18} color="var(--color-accent)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Live Sandbox Playground</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={copyOutput}
            title="Copy output"
            style={{
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
            {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
          </button>
          <button
            onClick={clearOutput}
            title="Clear"
            style={{
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
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div
        ref={outputRef}
        style={{
          height: 280,
          overflowY: 'auto',
          padding: 'var(--space-4) var(--space-5)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          background: '#06060a',
        }}
      >
        {output.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-accent)' }}>$</span> Enter a tool name below and press Send. Try: get_site_status, check_adsense_status, deploy_site
          </div>
        )}
        {output.map((line, i) => (
          <div key={i} style={{
            color: line.type === 'error'
              ? 'var(--color-danger)'
              : line.type === 'input'
              ? 'var(--color-accent)'
              : 'var(--color-success)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {line.text}
          </div>
        ))}
        {loading && (
          <div style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-accent)' }}>$</span> Processing...
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-5)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter tool name (e.g., get_site_status)..."
          disabled={loading}
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            background: loading ? 'var(--color-bg-elevated)' : 'var(--color-accent)',
            color: loading ? 'var(--color-text-muted)' : 'white',
            border: '1px solid var(--color-border)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Send size={14} />
          Send
        </button>
      </div>
    </motion.div>
  );
}
