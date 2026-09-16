import type { LogItem } from '../store';

const GAS_API_URL = import.meta.env.VITE_GAS_API_URL || '';


interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  logs?: LogItem[];
  user?: { id: string; nickname: string; token: string };
}

const post = async (payload: Record<string, unknown>): Promise<ApiResponse> => {
  if (!GAS_API_URL) throw new Error('Google Sheets API URL이 설정되지 않았습니다.');
  const res = await fetch(GAS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('Google Sheets API에 연결하지 못했습니다.');
  return res.json();
};

const hashPassword = async (password: string) => {
  if (!globalThis.crypto?.subtle) throw new Error('안전한 로그인 기능을 지원하지 않는 브라우저입니다.');
  const data = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

/** Google Apps Script Web App과 통신하는 클라이언트 */
export const gasApi = {
  async login(nickname: string, password: string) {
    const passwordHash = await hashPassword(password);
    const data = await post({ action: 'login', nickname, passwordHash });
    if (data.status === 'success' && data.user) return data.user;
    throw new Error(data.message || '닉네임 또는 비밀번호를 확인해 주세요.');
  },

  async getLogs(studentId: string, token: string): Promise<LogItem[]> {
    try {
      const data = await post({ action: 'get', studentId, token });
      if (data.status === 'success' && Array.isArray(data.logs)) return data.logs;
      throw new Error(data.message || '기록을 불러오지 못했습니다.');
    } catch (err) {
      console.warn('[GAS API] Failed to fetch logs:', err);
      throw err;
    }
  },

  async addLog(log: LogItem, token: string): Promise<boolean> {
    try {
      const data = await post({ action: 'add', studentId: log.studentId, token, log });
      return data.status === 'success';
    } catch (err) {
      console.warn('[GAS API] Failed to add log:', err);
      return false;
    }
  },

  async editLog(log: LogItem, token: string): Promise<boolean> {
    try {
      const data = await post({ action: 'edit', studentId: log.studentId, token, log });
      return data.status === 'success';
    } catch (err) {
      console.warn('[GAS API] Failed to edit log:', err);
      return false;
    }
  },

  async deleteLog(id: string, token: string): Promise<boolean> {
    try {
      const data = await post({ action: 'delete', id, token });
      return data.status === 'success';
    } catch (err) {
      console.warn('[GAS API] Failed to delete log:', err);
      return false;
    }
  },
};
