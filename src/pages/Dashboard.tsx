import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#AF19FF', '#FF6666'];

export const Dashboard = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  const monthlyLogs = useMemo(() => {
    return store.logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === year && (logDate.getMonth() + 1) === month;
    });
  }, [store.logs, year, month]);

  const totalIncome = monthlyLogs.filter(l => l.type === 'income').reduce((acc, l) => acc + l.amount, 0);
  const totalExpense = monthlyLogs.filter(l => l.type === 'expense').reduce((acc, l) => acc + l.amount, 0);
  
  // Total balance across ALL time
  const totalBalance = store.logs.reduce((acc, log) => 
    log.type === 'income' ? acc + log.amount : acc - log.amount
  , 0);

  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  // Group expenses by category
  const expenseData = useMemo(() => {
    const expenses = monthlyLogs.filter(l => l.type === 'expense');
    const grouped = expenses.reduce((acc, log) => {
      acc[log.description] = (acc[log.description] || 0) + log.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [monthlyLogs]);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>용돈 대시보드 📊</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right', marginRight: 10 }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>내 지갑 잔액</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-color)', fontSize: '1.2rem' }}>{totalBalance.toLocaleString()}원</div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/record')} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}><BookOpen size={16}/></button>
          <button className="btn-primary" onClick={() => navigate('/treehouse')} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}><Home size={16}/></button>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
        <button onClick={prevMonth} style={{ background: 'transparent', padding: 10, cursor: 'pointer' }}><ChevronLeft size={24}/></button>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-color)' }}>{year}년 {month}월</h3>
        <button onClick={nextMonth} style={{ background: 'transparent', padding: 10, cursor: 'pointer' }}><ChevronRight size={24}/></button>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ flex: 1, background: 'white', padding: 20, borderRadius: 16, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: 10, fontSize: '1.1rem' }}>수입 💰</div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-color)' }}>{totalIncome.toLocaleString()}원</div>
        </motion.div>
        
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ flex: 1, background: 'white', padding: 20, borderRadius: 16, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#FF6B6B', fontWeight: 'bold', marginBottom: 10, fontSize: '1.1rem' }}>지출 🛒</div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-color)' }}>{totalExpense.toLocaleString()}원</div>
        </motion.div>
      </div>

      {expenseData.length > 0 && (
        <div style={{ marginTop: 20, background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h4 style={{ textAlign: 'center', marginBottom: 10 }}>지출 비율 (어디에 썼을까?)</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, background: 'var(--secondary-color)', padding: 25, borderRadius: 16, textAlign: 'center', color: 'var(--text-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: '1.1rem' }}>이번 달 결산 (수입 - 지출)</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: (totalIncome - totalExpense) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
          {(totalIncome - totalExpense) > 0 ? '+' : ''}{(totalIncome - totalExpense).toLocaleString()}원
        </div>
      </div>

    </div>
  );
};
