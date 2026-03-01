import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Download, Code2, ExternalLink } from 'lucide-react';

export default function DeploymentOutput({ config, txs = [], onClose }) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(config, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = jsonString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name?.replace(/\s+/g, '-').toLowerCase() || 'protocol'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative w-full max-w-2xl glass rounded-2xl border border-btc-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-btc-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-btc-orange" />
            <h3 className="text-lg font-bold text-white">Deployment Config</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-btc-surface hover:bg-btc-border text-sm font-mono text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-btc-surface hover:bg-btc-border text-sm font-mono text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-btc-surface text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transactions */}
        {txs && txs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">On-chain transactions</h3>
            <div className="space-y-2">
              {txs.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-btc-darker rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-sm font-mono text-gray-300">{tx.type}</span>
                  </div>
                  <a
                    href={tx.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-btc-orange hover:underline flex items-center gap-1"
                  >
                    {tx.txid.slice(0, 8)}...{tx.txid.slice(-8)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON Output */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <pre className="text-sm font-mono text-gray-300 bg-btc-darker rounded-xl p-4 border border-btc-border overflow-x-auto">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-btc-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-600">
            {config.modules?.length || 0} modules configured
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            Ready for OP_NET deployment
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
