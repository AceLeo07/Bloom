import { create } from 'zustand';

export type PlantStage = 'seed' | 'sapling' | 'bloom' | 'decay';

interface HabitState {
  plantStage: PlantStage;
  plantHealth: number; // 0-100
  showModal: boolean;
  brightness: number; // 0-1
  lastAnswer: 'positive' | 'negative' | null;
  
  setShowModal: (show: boolean) => void;
  answerQuestion: (isPositive: boolean) => void;
  updatePlantStage: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  plantStage: 'seed',
  plantHealth: 50,
  showModal: false,
  brightness: 0.5,
  lastAnswer: null,

  setShowModal: (show: boolean) => set({ showModal: show }),

  answerQuestion: (isPositive: boolean) => {
    const currentHealth = get().plantHealth;
    const change = isPositive ? 15 : -15;
    const newHealth = Math.max(0, Math.min(100, currentHealth + change));
    
    set({
      plantHealth: newHealth,
      brightness: isPositive ? Math.min(1, get().brightness + 0.15) : Math.max(0.2, get().brightness - 0.15),
      lastAnswer: isPositive ? 'positive' : 'negative',
      showModal: false,
    });

    // Trigger stage update after state change
    setTimeout(() => get().updatePlantStage(), 100);
  },

  updatePlantStage: () => {
    const health = get().plantHealth;
    let newStage: PlantStage;

    if (health >= 75) {
      newStage = 'bloom';
    } else if (health >= 50) {
      newStage = 'sapling';
    } else if (health >= 25) {
      newStage = 'seed';
    } else {
      newStage = 'decay';
    }

    if (newStage !== get().plantStage) {
      set({ plantStage: newStage });
    }
  },
}));
