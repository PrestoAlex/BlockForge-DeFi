import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, Vault, TrendingUp, Gift, Clock, Shield, Hexagon, Workflow } from 'lucide-react';
import { getModuleById } from '../data/modules';

const ICON_MAP = {
  Vault,
  TrendingUp,
  Gift,
  Clock,
  Shield,
  Hexagon,
};

function PipelineNode({ moduleId, index }) {
  const mod = getModuleById(moduleId);
  if (!mod) return null;
  const Icon = ICON_MAP[mod.icon];

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.6, opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
        delay: index * 0.1,
      }}
      className="flex items-center gap-2"
    >
      <div
        className="relative glass rounded-xl p-3 flex items-center gap-2.5 border border-transparent hover:scale-105 transition-transform duration-200 cursor-default"
        style={{
          borderColor: `${mod.color}40`,
          boxShadow: `0 0 20px ${mod.color}15`,
        }}
      >
        {/* Snap effect dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
          style={{ background: mod.color }}
        />

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${mod.color}20` }}
        >
          {Icon && <Icon className="w-4 h-4" style={{ color: mod.color }} />}
        </div>
        <span className="text-sm font-semibold text-white">{mod.name}</span>
      </div>
    </motion.div>
  );
}

function PipelineArrow({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="flex items-center px-1"
    >
      <div className="relative w-8 h-[2px] bg-gradient-to-r from-btc-orange/60 to-btc-orange/20 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-3 bg-btc-orange rounded-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-btc-orange/60" />
    </motion.div>
  );
}

function PipelineRow({ label, color, pipeline }) {
  if (pipeline.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: `${color}20` }} />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <AnimatePresence mode="popLayout">
          {pipeline.map((moduleId, i) => (
            <React.Fragment key={moduleId}>
              <PipelineNode moduleId={moduleId} index={i} />
              {i < pipeline.length - 1 && <PipelineArrow delay={i * 0.1} />}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PipelineVisualizer({ depositPipeline, withdrawPipeline, selectedModules }) {
  const isEmpty = selectedModules.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 rounded-full bg-neon-blue" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Pipeline</h2>
      </div>

      <div className="glass rounded-2xl p-5 min-h-[280px] flex flex-col justify-center">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Workflow className="w-12 h-12 text-gray-700 mb-4" />
            </motion.div>
            <p className="text-gray-600 text-sm font-mono">Select modules to build your pipeline</p>
            <p className="text-gray-700 text-xs mt-1">Start with Vault as your core block</p>
          </div>
        ) : (
          <div className="space-y-6">
            <PipelineRow
              label="deposit() flow"
              color="#00FF88"
              pipeline={depositPipeline}
            />
            <PipelineRow
              label="withdraw() flow"
              color="#00D4FF"
              pipeline={withdrawPipeline}
            />

            {/* Stats */}
            <div className="pt-4 border-t border-btc-border flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-btc-orange">{selectedModules.length}</div>
                <div className="text-[10px] font-mono text-gray-600 uppercase">Modules</div>
              </div>
              <div className="w-px h-8 bg-btc-border" />
              <div className="text-center">
                <div className="text-lg font-bold text-neon-green">{depositPipeline.length}</div>
                <div className="text-[10px] font-mono text-gray-600 uppercase">Deposit Steps</div>
              </div>
              <div className="w-px h-8 bg-btc-border" />
              <div className="text-center">
                <div className="text-lg font-bold text-neon-blue">{withdrawPipeline.length}</div>
                <div className="text-[10px] font-mono text-gray-600 uppercase">Withdraw Steps</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
