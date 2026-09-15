import React, { useState, useEffect } from 'react';
import { useAppStore, type LogItem } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Home, PieChart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INCOME_CATEGORIES = ['정기용돈', '심부름', '용돈보너스', '기타수입'];
const EXPENSE_CATEGORIES = ['간식', '학용품', '장난감/게임', '기타지출'];

export const Record = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  
  // 최초 진입 시 구글 시트와 동기화 시도
  useEffect(() => {
    store.syncWithGoogleSheets();
  }, []);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const balance = store.logs.reduce((acc, log) => 
    log.type === 'income' ? acc + log.amount : acc - log.amount
  , 0);

  // 날짜 기준 내림차순 정렬
  const sortedLogs = [...store.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc || !date) return;
    
    if (editingId) {
      store.editLog({
        id: editingId,
        date,
        type,
        amount: Number(amount),
        description: desc
      });
      setEditingId(null);
    } else {
      store.addLog({
        date,
        type,
        amount: Number(amount),
        description: desc
      });
    }
    setAmount('');
    setDesc('');
  };

  const startEdit = (log: LogItem) => {
    setEditingId(log.id);
    setDate(log.date);
    setType(log.type);
    setAmount(log.amount.toString());
    setDesc(log.description);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말 이 기록을 지울까요?')) {
      store.deleteLog(id);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/src/assets/squirrel_character.png" alt="Squirrel" style={{ width: 40 }} />
          용돈 기록장
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>내 지갑 잔액</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-color)', fontSize: '1.2rem' }}>{balance.toLocaleString()}원</div>
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.95rem' }}>🌰 {store.acorns}개</span>
          <button 
            className="btn-primary" 
            title="구글 시트와 동기화" 
            onClick={() => store.syncWithGoogleSheets()} 
            disabled={store.isSyncing}
            style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={16} className={store.isSyncing ? 'spin' : ''} style={{ animation: store.isSyncing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}><PieChart size={16}/></button>
          <button className="btn-primary" onClick={() => navigate('/treehouse')} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}><Home size={16}/></button>
        </div>
      </div>

      
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '12px', borderRadius: 12, border: '2px solid #EED2AA', fontFamily: 'Jua', outline: 'none' }} required />
          <select value={type} onChange={e => setType(e.target.value as any)} style={{ padding: '12px', borderRadius: 12, border: '2px solid #EED2AA', fontFamily: 'Jua', outline: 'none' }}>
            <option value="income">수입 (+)</option>
            <option value="expense">지출 (-)</option>
          </select>
          <input type="number" placeholder="금액" value={amount} onChange={e => setAmount(e.target.value)} style={{ padding: '12px', borderRadius: 12, border: '2px solid #EED2AA', flex: 1, fontFamily: 'Jua', outline: 'none' }} required />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="text" placeholder="어디에 썼어? (또는 받았어?)" value={desc} onChange={e => setDesc(e.target.value)} style={{ padding: '12px', borderRadius: 12, border: '2px solid #EED2AA', flex: 1, fontFamily: 'Jua', outline: 'none' }} required />
          <button type="submit" className="btn-primary" style={{ padding: '12px 20px', width: 120 }}>
            {editingId ? '수정하기' : '기록하기!'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setAmount(''); setDesc(''); }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: '#eee', fontFamily: 'Jua', width: 80 }}>취소</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              type="button" 
              onClick={() => setDesc(cat)}
              style={{ padding: '6px 12px', borderRadius: 12, border: '1px solid #ccc', background: desc === cat ? 'var(--secondary-color)' : 'white', cursor: 'pointer', fontFamily: 'Jua', fontSize: '0.9rem', color: 'var(--text-color)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </form>

      <div style={{ marginTop: 20 }}>
        <AnimatePresence>
          {sortedLogs.map(log => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 20px', borderRadius: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{log.date}</span>
                <span style={{ color: log.type === 'income' ? '#4CAF50' : '#FF6B6B', fontWeight: 'bold' }}>
                  {log.type === 'income' ? '수입' : '지출'}
                </span>
                <strong>{log.description}</strong> 
                <span style={{ color: log.type === 'income' ? '#4CAF50' : '#FF6B6B' }}>
                  {log.type === 'income' ? '+' : '-'}{log.amount.toLocaleString()}원
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => startEdit(log)} style={{ background: 'transparent', padding: 5, color: '#888' }}><Edit2 size={20}/></button>
                <button onClick={() => handleDelete(log.id)} style={{ background: 'transparent', padding: 5, color: 'var(--danger-color)' }}><Trash2 size={20}/></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {store.logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            아직 기록이 없어! 첫 번째 용돈을 기록하고 도토리를 받아보자!
          </div>
        )}
      </div>
    </div>
  );
};
