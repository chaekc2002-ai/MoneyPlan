import React, { useState } from 'react';
import { useAppStore } from '../store';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TutorialPopup = ({ onClose }: { onClose: () => void }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: 'white', padding: '30px', borderRadius: '20px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}
        >
          <h2 style={{ color: 'var(--accent-color)', marginBottom: '15px' }}>도토리 마을에 온 걸 환영해! 🐿️</h2>
          <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
            매일 꾸준히 <strong>용돈 기록</strong>을 남길 때마다 귀여운 <strong>도토리 1개</strong>를 받을 수 있어!
          </p>
          <p style={{ marginBottom: '20px', lineHeight: '1.5' }}>
            모은 도토리로 다람쥐의 <strong>나무집을 예쁘게 꾸며보자.</strong><br/>
            (아이템 당 10~30개의 도토리가 필요해!)
          </p>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>알겠어! 시작할래</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Login = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const login = useAppStore(state => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      login(nickname);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', padding: '20px',
      background: 'var(--primary-color)'
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'white', padding: '40px', borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px',
          textAlign: 'center'
        }}
      >
        <img src="/src/assets/squirrel_character.png" alt="Squirrel" style={{ width: '120px', marginBottom: '20px' }} />
        <h1 style={{ color: 'var(--text-color)', marginBottom: '30px' }}>도토리 기록장</h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="너의 멋진 닉네임!"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{
              padding: '12px 15px', borderRadius: '12px', border: '2px solid #EED2AA',
              fontFamily: 'Jua, sans-serif', fontSize: '1rem', outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '12px 15px', borderRadius: '12px', border: '2px solid #EED2AA',
              fontFamily: 'Jua, sans-serif', fontSize: '1rem', outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            입장하기
          </button>
        </form>
      </motion.div>
    </div>
  );
};
