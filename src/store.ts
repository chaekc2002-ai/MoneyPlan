import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gasApi } from './services/gasApi';

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
  isSyncing: boolean;
  login: (nickname: string) => void;
  setFirstLoginCompleted: () => void;
  addAcorns: (amount: number) => void;
  unlockItem: (itemId: string, cost: number) => void;
  addLog: (log: Omit<LogItem, 'id'>) => Promise<void>;
  editLog: (log: LogItem) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  syncWithGoogleSheets: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      acorns: 0,
      unlockedItems: [],
      logs: [],
      isSyncing: false,
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
      addLog: async (log) => {
        const newLog: LogItem = { ...log, id: Date.now().toString() };
        // 1. UI 즉시 반응 (낙관적 업데이트)
        set((state) => ({
          logs: [newLog, ...state.logs],
          acorns: state.acorns + 1
        }));
        // 2. 구글 시트 백그라운드 동기화
        await gasApi.addLog(newLog);
      },
      editLog: async (updatedLog) => {
        set((state) => ({
          logs: state.logs.map(log => log.id === updatedLog.id ? updatedLog : log)
        }));
        await gasApi.editLog(updatedLog);
      },
      deleteLog: async (id) => {
        set((state) => ({
          logs: state.logs.filter(log => log.id !== id)
        }));
        await gasApi.deleteLog(id);
      },
      syncWithGoogleSheets: async () => {
        set({ isSyncing: true });
        try {
          const remoteLogs = await gasApi.getAllLogs();
          if (remoteLogs && remoteLogs.length > 0) {
            // 로컬 로그와 원격 로그 병합 (id 기준 중복 제거)
            const localLogs = get().logs;
            const logMap = new Map<string, LogItem>();
            // 원격 데이터 우선 등록
            remoteLogs.forEach(l => logMap.set(String(l.id), l));
            // 로컬 데이터 중 시트에 아직 없는 것이 있다면 추가
            localLogs.forEach(l => {
              if (!logMap.has(String(l.id))) {
                logMap.set(String(l.id), l);
              }
            });
            const merged = Array.from(logMap.values());
            set({ logs: merged });
          }
        } finally {
          set({ isSyncing: false });
        }
      },
    }),

    {
      name: 'money-plan-storage', // 브라우저 로컬 스토리지에 저장될 키 이름
    }
  )
);
