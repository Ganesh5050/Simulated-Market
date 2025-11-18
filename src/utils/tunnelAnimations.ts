import { TunnelAnimation } from '@/types/tunnel';

export const tunnelAnimations = {
  // Default tunnel animation configuration
  default: {
    isActive: true,
    duration: 3000,
    particles: 200,
    energyWaves: true,
    neuralPulses: true,
  } as TunnelAnimation,

  // Fast animation for quick testing
  fast: {
    isActive: true,
    duration: 1500,
    particles: 100,
    energyWaves: true,
    neuralPulses: true,
  } as TunnelAnimation,

  // Slow animation for dramatic effect
  slow: {
    isActive: true,
    duration: 5000,
    particles: 300,
    energyWaves: true,
    neuralPulses: true,
  } as TunnelAnimation,

  // Minimal animation for performance
  minimal: {
    isActive: true,
    duration: 2000,
    particles: 50,
    energyWaves: false,
    neuralPulses: true,
  } as TunnelAnimation,
};

export function createTunnelAnimation(config: Partial<TunnelAnimation> = {}): TunnelAnimation {
  return {
    ...tunnelAnimations.default,
    ...config,
  };
}

export function getAnimationEasing(t: number): number {
  // Ease-in-out cubic function
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function calculateParticlePosition(
  index: number,
  totalParticles: number,
  time: number,
  radius: number = 0.2
): { x: number; y: number; z: number } {
  const angle = (index / totalParticles) * Math.PI * 2;
  const speed = 0.1;
  const z = (time * speed) % 8 - 4; // Move from -4 to 4
  
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    z: z,
  };
}

export function calculateEnergyWave(
  time: number,
  frequency: number = 1,
  amplitude: number = 0.3
): number {
  return Math.sin(time * frequency) * amplitude;
}

export function calculateNeuralPulse(
  time: number,
  delay: number = 0,
  speed: number = 0.2
): { position: number; intensity: number } {
  const position = ((time - delay) * speed) % 8 - 4;
  const intensity = Math.max(0, 1 - Math.abs(position) / 4);
  
  return { position, intensity };
}

export function generateParticleColors(count: number): string[] {
  const colors = [
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#ff8000', // Orange
    '#8000ff', // Purple
  ];
  
  return Array.from({ length: count }, (_, i) => 
    colors[i % colors.length]
  );
}

export function createAnimationTimeline(duration: number) {
  const phases = [
    { name: 'tunnel-start', time: 0, duration: duration * 0.1 },
    { name: 'particles-accelerate', time: duration * 0.1, duration: duration * 0.3 },
    { name: 'energy-waves', time: duration * 0.4, duration: duration * 0.4 },
    { name: 'neural-pulses', time: duration * 0.8, duration: duration * 0.2 },
  ];
  
  return phases;
}

export function interpolateValue(
  startValue: number,
  endValue: number,
  progress: number,
  easing: (t: number) => number = getAnimationEasing
): number {
  return startValue + (endValue - startValue) * easing(progress);
}

export function createParticleSystem(totalParticles: number) {
  const positions = new Float32Array(totalParticles * 3);
  const colors = new Float32Array(totalParticles * 3);
  const sizes = new Float32Array(totalParticles);
  
  for (let i = 0; i < totalParticles; i++) {
    const i3 = i * 3;
    
    // Random positions
    positions[i3] = (Math.random() - 0.5) * 0.4;
    positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
    positions[i3 + 2] = (Math.random() - 0.5) * 8;
    
    // Random colors
    const color = generateParticleColors(1)[0];
    const rgb = hexToRgb(color);
    colors[i3] = rgb.r;
    colors[i3 + 1] = rgb.g;
    colors[i3 + 2] = rgb.b;
    
    // Random sizes
    sizes[i] = Math.random() * 0.02 + 0.01;
  }
  
  return { positions, colors, sizes };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0, g: 0, b: 0 };
}
