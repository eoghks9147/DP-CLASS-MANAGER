import { state, saveData } from './storage.js';
import { showToast, renderTable } from './utils.js';

export function addLog(type, studentId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const student = state.studentDB.find(s => s.id === studentId);
    if (!student || !student.name) return;

    if (!state.activities[type][studentId]) {
        state.activities[type][studentId] = { count: 0, dates: [] };
    }

    state.activities[type][studentId].dates.push({ date: todayStr, memo: '' });
    state.activities[type][studentId].count = state.activities[type][studentId].dates.length;

    saveData();
    renderTable(type);
    showToast(`${student.name} 학생의 활동이 추가 기록되었습니다.`);
}