import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vault, TrendingUp, Gift, Clock, Shield, Hexagon } from 'lucide-react';
import { MODULES, MODULE_CATEGORIES } from '../data/modules';

const ICON_MAP = {
  Vault,
  TrendingUp,
  Gift,
  Clock,
  Shield,
  Hexagon,
};

export default function ModuleSelector({ selectedModules, onToggle }) {
  const categories = Object.values(MODULE_CATEGORIES);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 rounded-full bg-btc-orange" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Modules</h2>
      </div>

      {categories.map((cat) => {
        const catModules = MODULES.filter((m) => m.category === cat);
        if (catModules.length === 0) return null;

        return (
          <div key={cat} className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600 px-1">
              {cat}
            </span>
            <AnimatePresence>
              {catModules.map((mod) => {
                const isSelected = selectedModules.includes(mod.id);
                const Icon = ICON_MAP[mod.icon];

                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => onToggle(mod.id)}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer
                      ${isSelected
                        ? 'glass border-l-2 shadow-lg'
                        : 'bg-btc-card hover:bg-btc-surface border-l-2 border-transparent'
                      }
                    `}
                    style={{
                      borderLeftColor: isSelected ? mod.color : 'transparent',
                      boxShadow: isSelected ? `0 0 15px ${mod.color}20` : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                        ${isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'}
                      `}
                      style={{
                        background: isSelected ? `${mod.color}20` : '#1E1E1E',
                      }}
                    >
                      {Icon && (
                        <Icon
                          className="w-4.5 h-4.5"
                          style={{ color: isSelected ? mod.color : '#888' }}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                          {mod.name}
                        </span>
                        {/* Toggle indicator */}
                        <div
                          className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                            ${isSelected ? 'border-transparent' : 'border-gray-600'}
                          `}
                          style={{
                            background: isSelected ? mod.color : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-btc-darker"
                              viewBox="0 0 12 12"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                      <p className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-gray-600' : 'text-gray-600'}`}>{mod.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Selected count */}
      <div className="pt-3 border-t border-btc-border">
        <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
          <span>Selected</span>
          <span className="text-btc-orange font-bold">{selectedModules.length} / {MODULES.length}</span>
        </div>
      </div>
    </div>
  );
}
