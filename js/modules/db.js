import { state, saveData } from './storage.js';
import { showToast, renderTable } from './utils.js';

export function buildInputs() {
    const container = document.getElementById('db-input-container');
    if (!container) return;
    container.innerHTML = '';
    state.studentDB.forEach(s => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition duration-150';
        div.innerHTML = `
            <span class="w-6 text-slate-400 text-xs font-bold text-center">${s.id}</span>
            <input type="text" id="db-input-${s.id}" value="${s.name}" placeholder="이름 없음" class="bg-transparent w-full font-bold text-sm text-slate-800 outline-none placeholder-slate-300">
        `;
        container.appendChild(div);
    });
}

export function fillDummyData() {
    const sampleNames = ['민우', '서연', '도현', '지아', '준우', '하은', '시우', '윤아', '지호', '수빈', '유준', '채원', '예준', '다인', '건우', '서진', '현우', '지원', '주원', '소윤'];
    for (let i = 1; i <= state.MAX_STUDENTS; i++) {
        const input = document.getElementById(`db-input-${i}`);
        if (input) input.value = sampleNames[i - 1] || '';
    }
    showToast('샘플 명단이 입력되었습니다.');
}

export function saveStudentDB() {
    for (let i = 1; i <= state.MAX_STUDENTS; i++) {
        const input = document.getElementById(`db-input-${i}`);
        if (input) {
            state.studentDB[i - 1].name = input.value.trim();
        }
    }
    saveData();
    // 전체 테이블 갱신
    ['speech', 'planner', 'meal', 'sports', 'library'].forEach(renderTable);
    showToast('학생 DB 데이터가 통합 저장되었습니다.');
}