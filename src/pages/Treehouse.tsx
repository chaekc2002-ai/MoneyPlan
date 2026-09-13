import React from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { ITEMS } from '../items';
import { motion } from 'framer-motion';

export const Treehouse = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const balance = store.logs.reduce((acc, log) => 
    log.type === 'income' ? acc + log.amount : acc - log.amount
  , 0);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>다람쥐의 나무집 🐿️</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right', marginRight: 10 }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>내 지갑 잔액</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-color)', fontSize: '1.2rem' }}>{balance.toLocaleString()}원</div>
          </div>
          <span style={{ marginRight: 15, fontWeight: 'bold', color: 'var(--accent-color)' }}>🌰 {store.acorns}개</span>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}>
            📊
          </button>
          <button className="btn-primary" onClick={() => navigate('/record')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 15px' }}>
            <BookOpen size={16}/> 기록장 가기
          </button>
        </div>
      </div>
      
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: 450, 
        marginTop: 20,
        backgroundImage: 'url(/src/assets/treehouse_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        {/* Render unlocked items */}
        {store.unlockedItems.map(itemId => {
          const item = ITEMS.find(i => i.id === itemId);
          if (!item) return null;
          return (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={item.id} 
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                padding: '10px 15px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 16,
                fontWeight: 'bold',
                color: 'var(--text-color)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {item.name}
            </motion.div>
          );
        })}
      </div>

      <h3 style={{ marginTop: 30, marginBottom: 15 }}>상점</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 15 }}>
        {ITEMS.map(item => {
          const isUnlocked = store.unlockedItems.includes(item.id);
          const canAfford = store.acorns >= item.cost;
          return (
            <div key={item.id} style={{ 
              background: 'white', padding: 20, borderRadius: 16, textAlign: 'center', 
              opacity: isUnlocked ? 0.6 : 1,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {isUnlocked && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.8rem', background: '#ccc', padding: '2px 6px', borderRadius: 8 }}>보유함</div>}
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 5 }}>{item.name}</div>
              <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: 10 }}>🌰 {item.cost}개</div>
              {!isUnlocked && (
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '8px 10px', fontSize: '1rem', opacity: canAfford ? 1 : 0.5 }}
                  onClick={() => store.unlockItem(item.id, item.cost)}
                  disabled={!canAfford}
                >
                  구매하기
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
