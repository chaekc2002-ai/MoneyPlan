import type { LogItem } from '../store';

const GAS_API_URL = import.meta.env.VITE_GAS_API_URL || '';

/**
 * Google Apps Script Web App과 통신하는 클라이언트
 * Apps Script Web App의 CORS 제한을 방지하기 위해 'text/plain;charset=utf-8' 헤더 사용
 */
export const gasApi = {
  /**
   * 구글 시트에 저장된 모든 로그를 가져옵니다.
   */
  async getAllLogs(): Promise<LogItem[]> {
    if (!GAS_API_URL) return [];
    try {
      // 1. GET 시도
      const res = await fetch(GAS_API_URL, {
        method: 'GET',
        redirect: 'follow',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.logs)) {
          return data.logs;
        }
      }

      // 2. 만약 GET이 지원되지 않는 경우 doPost({ action: 'get' })로 폴백 시도
      const postRes = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'get' }),
        redirect: 'follow',
      });
      const postData = await postRes.json();
      if (postData.status === 'success' && Array.isArray(postData.logs)) {
        return postData.logs;
      }
      return [];
    } catch (err) {
      console.warn('[GAS API] Failed to fetch logs from Google Sheets:', err);
      return [];
    }
  },

  /**
   * 새 기록을 구글 시트에 추가합니다.
   */
  async addLog(log: LogItem): Promise<boolean> {
    if (!GAS_API_URL) return false;
    try {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'add',
          log: {
            id: log.id,
            date: log.date,
            type: log.type,
            amount: log.amount,
            description: log.description,
          },
        }),
        redirect: 'follow',
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (err) {
      console.warn('[GAS API] Failed to add log to Google Sheets:', err);
      return false;
    }
  },

  /**
   * 구글 시트의 기존 기록을 수정합니다.
   */
  async editLog(log: LogItem): Promise<boolean> {
    if (!GAS_API_URL) return false;
    try {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'edit',
          log: {
            id: log.id,
            date: log.date,
            type: log.type,
            amount: log.amount,
            description: log.description,
          },
        }),
        redirect: 'follow',
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (err) {
      console.warn('[GAS API] Failed to edit log in Google Sheets:', err);
      return false;
    }
  },

  /**
   * 구글 시트의 특정 기록을 삭제합니다.
   */
  async deleteLog(id: string): Promise<boolean> {
    if (!GAS_API_URL) return false;
    try {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'delete',
          id: id,
        }),
        redirect: 'follow',
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (err) {
      console.warn('[GAS API] Failed to delete log in Google Sheets:', err);
      return false;
    }
  },
};
