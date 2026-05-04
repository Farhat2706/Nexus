import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources: string[];
  timestamp: Date;
}

interface AppState {
  messages: Message[];
  mode: string;
  isLoading: boolean;
  stats: {
    queriesResolved: number;
    pagesScraped: number;
    avgResponseTime: string;
  };
  addMessage: (msg: Message) => void;
  setMode: (mode: string) => void;
  setLoading: (val: boolean) => void;
  setStats: (stats: AppState['stats']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [],
  mode: 'deep',
  isLoading: false,
  stats: {
    queriesResolved: 0,
    pagesScraped: 0,
    avgResponseTime: '0s',
  },
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setMode: (mode) => set({ mode }),
  setLoading: (val) => set({ isLoading: val }),
  setStats: (stats) => set({ stats }),
}));