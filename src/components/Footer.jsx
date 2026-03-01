import React from 'react';
import { Github, Blocks, Twitter, Globe, MessageCircle } from 'lucide-react';

export default function Footer({ onReset }) {
  return (
    <footer className="border-t border-btc-border mt-auto">
      {/* Centered Social Links */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <div className="flex items-center gap-3">
          {/* Twitter/X */}
          <a
            href="https://x.com/opnetbtc"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-btc-orange/10 border border-btc-orange/30 flex items-center justify-center transition-all duration-200 hover:bg-btc-orange/20 hover:border-btc-orange hover:shadow-glow group"
            title="Follow us on X"
          >
            <Twitter className="w-4 h-4 text-btc-orange group-hover:text-white transition-colors" />
          </a>

          {/* Website */}
          <a
            href="https://opnet.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-btc-orange/10 border border-btc-orange/30 flex items-center justify-center transition-all duration-200 hover:bg-btc-orange/20 hover:border-btc-orange hover:shadow-glow group"
            title="Visit OP_NET Website"
          >
            <Globe className="w-4 h-4 text-btc-orange group-hover:text-white transition-colors" />
          </a>

          {/* Discord */}
          <a
            href="https://discord.com/invite/opnet"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-btc-orange/10 border border-btc-orange/30 flex items-center justify-center transition-all duration-200 hover:bg-btc-orange/20 hover:border-btc-orange hover:shadow-glow group"
            title="Join our Discord"
          >
            <MessageCircle className="w-4 h-4 text-btc-orange group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      {/* Centered Title */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-center">
        <div className="flex items-center gap-2 text-xs font-mono text-gradient">
          <Blocks className="w-3.5 h-3.5 text-btc-orange" />
          <span>BlockForge v1.0 — Composable DeFi Lego on Bitcoin L1</span>
        </div>
      </div>
    </footer>
  );
}
