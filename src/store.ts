import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gasApi } from './services/gasApi';

export interface LogItem {
  id: string;
  studentId: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
}

interface UserState {
  id: string;
  nickname: string;
  token: string;
  isFirstLogin: boolean;
}

interface AppStore {
  user: UserState | null;
  acorns: number;
  unlockedItems: string[];
  logs: LogItem[];
  isSyncing: boolean;
  login: (user: Omit<UserState, 'isFirstLogin'>) => void;
  logout: () => void;
  setFirstLoginCompleted: () => void;
  addAcorns: (amount: number) => void;
  unlockItem: (itemId: string, cost: number) => void;
  addLog: (log: Omit<LogItem, 'id' | 'studentId'>) => Promise<void>;
  editLog: (log: Omit<LogItem, 'studentId'>) => Promise<void>;
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
      // 계정 전환 시 이전 학생의 화면 데이터가 남지 않도록 즉시 초기화한다.
      login: (user) => set({ user: { ...user, isFirstLogin: true }, logs: [], acorns: 0, unlockedItems: [] }),
      logout: () => set({ user: null, logs: [], acorns: 0, unlockedItems: [], isSyncing: false }),
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
        const user = get().user;
        if (!user) throw new Error('로그인이 필요합니다.');
        const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `log-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const newLog: LogItem = { ...log, id, studentId: user.id };
        // 1. UI 즉시 반응 (낙관적 업데이트)
        set((state) => ({
          logs: [newLog, ...state.logs],
          acorns: state.acorns + 1
        }));
        // 2. 구글 시트 백그라운드 동기화
        const saved = await gasApi.addLog(newLog, user.token);
        if (!saved) throw new Error('시트에 기록을 저장하지 못했습니다. 다시 시도해 주세요.');
      },
      editLog: async (updatedLog) => {
        const user = get().user;
        if (!user) throw new Error('로그인이 필요합니다.');
        const log: LogItem = { ...updatedLog, studentId: user.id };
        set((state) => ({
          logs: state.logs.map(item => item.id === log.id ? log : item)
        }));
        const saved = await gasApi.editLog(log, user.token);
        if (!saved) throw new Error('시트의 기록을 수정하지 못했습니다. 다시 시도해 주세요.');
      },
      deleteLog: async (id) => {
        const user = get().user;
        if (!user) throw new Error('로그인이 필요합니다.');
        set((state) => ({
          logs: state.logs.filter(log => log.id !== id)
        }));
        const deleted = await gasApi.deleteLog(id, user.id, user.token);
        if (!deleted) throw new Error('시트의 기록을 삭제하지 못했습니다. 다시 시도해 주세요.');
      },
      syncWithGoogleSheets: async () => {
        set({ isSyncing: true });
        const user = get().user;
        if (!user) {
          set({ isSyncing: false });
          return;
        }
        try {
          const remoteLogs = await gasApi.getLogs(user.id, user.token);
          // 서버 필터와 별개로 클라이언트에서도 한 번 더 확인한다.
          const ownRemoteLogs = remoteLogs.filter(log => log.studentId === user.id);
          if (ownRemoteLogs.length > 0) {
            // 로컬 로그와 원격 로그 병합 (id 기준 중복 제거)
            const localLogs = get().logs.filter(log => log.studentId === user.id);
            const logMap = new Map<string, LogItem>();
            // 원격 데이터 우선 등록
            ownRemoteLogs.forEach(l => logMap.set(String(l.id), l));
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
      name: 'money-plan-storage',
      version: 2,
      // 공용 기기에서 이전 학생으로 자동 로그인되지 않도록 로그인·기록을 저장하지 않는다.
      partialize: () => ({}),
      migrate: () => ({}),
    }
  )
);
