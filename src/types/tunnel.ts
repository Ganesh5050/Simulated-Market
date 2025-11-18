export interface TunnelState {
  phase: 'idle' | 'analyzing' | 'completed' | 'focus-group';
  userIdea: string;
  isSimulating: boolean;
  countries: Country[];
  selectedPersona: Persona | null;
  focusGroup: string[];
  globalDeployment: boolean;
}

export interface TunnelAnimation {
  isActive: boolean;
  duration: number;
  particles: number;
  energyWaves: boolean;
  neuralPulses: boolean;
}

export interface SimulationPhase {
  name: string;
  duration: number;
  description: string;
  nextPhase?: string;
}
