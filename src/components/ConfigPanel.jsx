import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Vault, TrendingUp, Gift, Clock, Shield, Hexagon } from 'lucide-react';
import { getModuleById } from '../data/modules';

const ICON_MAP = {
  Vault,
  TrendingUp,
  Gift,
  Clock,
  Shield,
  Hexagon,
};

function SliderField({ field, value, onChange }) {
  const pct = ((value - field.min) / (field.max - field.min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-gray-400">{field.label}</label>
        <span className="text-xs font-mono font-bold text-btc-orange">{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-btc-border
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-btc-orange
            [&::-webkit-slider-thumb]:shadow-glow
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
          "
          style={{
            background: `linear-gradient(to right, #F7931A ${pct}%, #1E1E1E ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-gray-400">{field.label}</label>
      <input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-btc-surface border border-btc-border rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-btc-orange focus:outline-none transition-colors"
      />
    </div>
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-gray-400">{field.label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-btc-surface border border-btc-border rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-btc-orange focus:outline-none transition-colors cursor-pointer"
      >
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({ field, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-mono text-gray-400">{field.label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`
          relative w-10 h-5 rounded-full transition-colors duration-200
          ${value ? 'bg-btc-orange' : 'bg-btc-border'}
        `}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{ left: value ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function TextField({ field, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-gray-400">{field.label}</label>
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-btc-surface border border-btc-border rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:border-btc-orange focus:outline-none transition-colors"
      />
    </div>
  );
}

const FIELD_COMPONENTS = {
  slider: SliderField,
  number: NumberField,
  select: SelectField,
  toggle: ToggleField,
  text: TextField,
};

const ModuleConfig = React.forwardRef(function ModuleConfig({ moduleId, config, onUpdate }, ref) {
  const mod = getModuleById(moduleId);
  if (!mod) return null;
  const Icon = ICON_MAP[mod.icon];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass rounded-xl p-4 space-y-3"
      style={{ borderLeft: `2px solid ${mod.color}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: `${mod.color}20` }}
        >
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color: mod.color }} />}
        </div>
        <span className="text-sm font-semibold text-white">{mod.name}</span>
      </div>

      <div className="space-y-3">
        {mod.configFields.map((field) => {
          const FieldComponent = FIELD_COMPONENTS[field.type];
          if (!FieldComponent) return null;
          const value = config?.[field.key] ?? field.default;
          return (
            <FieldComponent
              key={field.key}
              field={field}
              value={value}
              onChange={(val) => onUpdate(moduleId, field.key, val)}
            />
          );
        })}
      </div>
    </motion.div>
  );
});

export default function ConfigPanel({ selectedModules, moduleConfigs, onUpdateConfig }) {
  const isEmpty = selectedModules.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 rounded-full bg-neon-purple" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Configuration</h2>
      </div>

      {isEmpty ? (
        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Settings className="w-10 h-10 text-gray-700 mb-3" />
          <p className="text-gray-600 text-sm font-mono text-center">
            Toggle modules to configure them
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {selectedModules.map((id) => (
              <ModuleConfig
                key={id}
                moduleId={id}
                config={moduleConfigs[id]}
                onUpdate={onUpdateConfig}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
