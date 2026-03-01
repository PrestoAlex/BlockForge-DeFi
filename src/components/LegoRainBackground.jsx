import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LEGO_SHAPES = ['■', '▣', '▤', '▦', '▧', '▨', '▩', '▪', '▫', '▬', '▭', '▮', '▯'];
const LEGO_COLORS = [
  '#F7931A', // btc-orange
  '#FFB347', // btc-gold
  '#00D4FF', // neon-blue
  '#00FF88', // neon-green
  '#A855F7', // neon-purple
  '#FF006E', // neon-pink
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function LegoRainBackground() {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute pointer-events-none';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = '-20px';
      particle.style.fontSize = (Math.random() * 10 + 8) + 'px';
      particle.style.color = getRandomItem(LEGO_COLORS);
      particle.style.opacity = Math.random() * 0.2 + 0.05; // 5-25% (was 10-40%)
      particle.style.fontWeight = 'bold';
      particle.style.fontFamily = 'monospace';
      particle.style.textShadow = `0 0 6px ${particle.style.color}`;
      particle.textContent = getRandomItem(LEGO_SHAPES);
      particle.style.willChange = 'transform';
      
      container.appendChild(particle);
      particlesRef.current.push(particle);

      const duration = Math.random() * 8 + 4; // 4-12s
      const drift = (Math.random() - 0.5) * 60; // -30px to 30px horizontal drift
      const rotation = Math.random() * 360 - 180; // -180deg to 180deg

      particle.animate(
        [
          {
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
            opacity: particle.style.opacity,
          },
          {
            transform: `translateY(${window.innerHeight + 20}px) translateX(${drift}px) rotate(${rotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: duration * 1000,
          easing: 'linear',
          fill: 'forwards',
        }
      ).onfinish = () => {
        particle.remove();
        const index = particlesRef.current.indexOf(particle);
        if (index > -1) {
          particlesRef.current.splice(index, 1);
        }
      };
    };

    const interval = setInterval(createParticle, 150);

    return () => {
      clearInterval(interval);
      particlesRef.current.forEach(p => p.remove());
      particlesRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
