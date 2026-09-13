import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LogItem {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
}

interface UserState {
  nickname: string;
  isFirstLogin: boolean;
}

interface AppStore {
  user: UserState | null;
  acorns: number;
  unlockedItems: string[];
  logs: LogItem[];
  login: (nickname: string) => void;
  setFirstLoginCompleted: () => void;
  addAcorns: (amount: number) => void;
  unlockItem: (itemId: string, cost: number) => void;
  addLog: (log: Omit<LogItem, 'id'>) => void;
  editLog: (log: LogItem) => void;
  deleteLog: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      acorns: 0,
      unlockedItems: [],
      logs: [],
      login: (nickname) => set({ user: { nickname, isFirstLogin: true } }),
      setFirstLoginCompleted: () => set((state) => ({
        user: state.user ? { ...state.user, isFirstLogin: false } : null
      })),
      addAcorns: (amount) => set((state) => ({ acorns: state.acorns + amount })),
      unlockItem: (itemId, cost) => set((state) => {
        if (state.acorns < cost || state.unlockedItems.includes(itemId)) return state;
        return {
          unlockedItems: [...state.unlockedItems, itemId],
          acorns: state.acorns - cost
        };
      }),
      addLog: (log) => set((state) => {
        const newLog = { ...log, id: Date.now().toString() };
        return {
          logs: [newLog, ...state.logs],
          acorns: state.acorns + 1
        };
      }),
      editLog: (updatedLog) => set((state) => ({
        logs: state.logs.map(log => log.id === updatedLog.id ? updatedLog : log)
      })),
      deleteLog: (id) => set((state) => ({
        logs: state.logs.filter(log => log.id !== id)
      })),
    }),
    {
      name: 'money-plan-storage', // 브라우저 로컬 스토리지에 저장될 키 이름
    }
  )
);
