import { state, saveData } from './storage.js';
import { showToast, getTypeKoreanName, renderTable } from './utils.js';
import { renderSpeechCalendar, renderPlannerCalendar, initCalendarState } from './calendar.js';
import { updateSpeechStats } from './speech.js';
import { updatePlannerStats } from './planner.js';
import { buildInputs } from './db.js';

export function openConfirmModal(title, msg, onConfirm) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = msg;
    
    const btn = document.getElementById('modal-confirm-btn');
    const newBtn = btn.cloneNode(true);
    btn.replaceWith(newBtn);
    newBtn.addEventListener('click', onConfirm);
    
    document.getElementById('custom-modal').classList.remove('hidden');
}

export function closeModal() {
    document.getElementById('custom-modal').classList.add('hidden');
}

export function openMemoModal(type, studentId, index) {
    const student = state.studentDB.find(s => s.id === studentId);
    const actData = state.activities[type][studentId];
    if (!student || !actData || !actData.dates[index]) return;

    state.currentMemoTarget = { type, studentId, index };
    const item = actData.dates[index];
    
    const dateVal = typeof item === 'object' ? item.date : item;
    const memoVal = typeof item === 'object' ? (item.memo || '') : '';

    document.getElementById('memo-modal-title').textContent = `${getTypeKoreanName(type)} 상세 기록`;
    document.getElementById('memo-modal-subtitle').textContent = `이름: ${student.name} (${student.id}번)`;
    
    document.getElementById('memo-date-input').value = dateVal;
    document.getElementById('memo-textarea').value = memoVal;

    document.getElementById('memo-modal').classList.remove('hidden');
    lucide.createIcons();
}

export function closeMemoModal() {
    document.getElementById('memo-modal').classList.add('hidden');
    state.currentMemoTarget = null;
}

export function saveMemo() {
    if (!state.currentMemoTarget) return;
    const { type, studentId, index } = state.currentMemoTarget;
    const textValue = document.getElementById('memo-textarea').value.trim();
    const dateValue = document.getElementById('memo-date-input').value;

    if (!dateValue) {
        showToast('날짜를 올바르게 지정해주세요.', 'alert');
        return;
    }

    const targetObj = state.activities[type][studentId].dates[index];
    if (typeof targetObj === 'object') {
        targetObj.date = dateValue; 
        targetObj.memo = textValue;
    } else {
        state.activities[type][studentId].dates[index] = { date: dateValue, memo: textValue };
    }

    saveData();
    renderTable(type);
    closeMemoModal();
    showToast('기록 날짜와 메모를 업데이트했습니다.');
}

export function deleteSelectedMemo() {
    if (!state.currentMemoTarget) return;
    const { type, studentId, index } = state.currentMemoTarget;
    
    state.activities[type][studentId].dates.splice(index, 1);
    state.activities[type][studentId].count = state.activities[type][studentId].dates.length;

    saveData();
    renderTable(type);
    closeMemoModal();
    showToast('해당 활동 기록이 삭제되었습니다.');
}

export function confirmResetAll() {
    openConfirmModal('데이터 초기화 경고', '현재 입력한 학생 명단과 발표, 플래너, 급식, 체육, 도서관의 모든 기록이 완전히 삭제됩니다. 초기화하시겠습니까?', () => {
        localStorage.removeItem('school_db_students_2026');
        localStorage.removeItem('school_db_activities_2026');
        
        state.studentDB = Array.from({ length: state.MAX_STUDENTS }, (_, i) => ({ id: i + 1, name: '' }));
        state.activities = { speech: {}, planner: {}, meal: {}, sports: {}, library: {} };
        
        state.studentDB.forEach(s => {
            state.activities.speech[s.id] = { count: 0, dates: [] };
            state.activities.planner[s.id] = { count: 0, dates: [] };
            ['meal', 'sports', 'library'].forEach(tab => {
                state.activities[tab][s.id] = { count: 0, dates: [] };
            });
        });

        initCalendarState();
        buildInputs();
        ['speech', 'planner', 'meal', 'sports', 'library'].forEach(renderTable);
        renderSpeechCalendar();
        updateSpeechStats();
        renderPlannerCalendar();
        updatePlannerStats();

        closeModal();
        showToast('시스템 데이터가 포맷팅되었습니다.', 'alert');
    });
}