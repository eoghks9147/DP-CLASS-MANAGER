import { loadData } from '../modules/storage.js';
import { initCalendarState, renderSpeechCalendar, renderPlannerCalendar } from '../modules/calendar.js';
import { buildInputs, fillDummyData, saveStudentDB } from '../modules/db.js';
import { renderTable } from '../modules/utils.js';
import { updateSpeechStats, adjustSpeechCount, updateSpeechMemo } from '../modules/speech.js';
import { updatePlannerStats, setPlannerCheckType, updatePlannerMemo } from '../modules/planner.js';
import { addLog } from '../modules/meal.js';
import { openMemoModal, closeMemoModal, saveMemo, deleteSelectedMemo, confirmResetAll, closeModal } from '../modules/modal.js';

// Expose functions globally to maintain HTML event bindings
window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition hover:bg-slate-800 text-slate-400 hover:text-slate-200';
    });
    const activeBtn = document.getElementById(`btn-tab-${tabId}`);
    if (activeBtn) {
        activeBtn.className = 'tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition bg-indigo-600 text-white font-bold shadow-sm';
    }

    const headerTitle = document.getElementById('current-tab-title');
    const info = {
        db: { text: '1. 학생 DB 설정 및 관리', icon: 'database' },
        speech: { text: '2. 발표 우수자 기록대장', icon: 'mic' },
        planner: { text: '3. 일일 플래너 검사 대장', icon: 'calendar-check' }, 
        meal: { text: '4. 추가 급식 도우미 관리 대장', icon: 'utensils' },
        sports: { text: '5. 체육 활동 참여 대장', icon: 'trophy' },
        library: { text: '6. 도서관 특별석 이용기록', icon: 'book-open' }
    };
    headerTitle.innerHTML = `<i data-lucide="${info[tabId].icon}" class="text-indigo-500"></i> ${info[tabId].text}`;
    lucide.createIcons();
};

// DB Module
window.fillDummyData = fillDummyData;
window.saveStudentDB = saveStudentDB;

// Speech Module
window.adjustSpeechCount = adjustSpeechCount;
window.updateSpeechMemo = updateSpeechMemo;

// Planner Module
window.setPlannerCheckType = setPlannerCheckType;
window.updatePlannerMemo = updatePlannerMemo;

// Log Module (Meal, Sports, Library)
window.addLog = addLog;

// Modal Module
window.openMemoModal = openMemoModal;
window.closeMemoModal = closeMemoModal;
window.saveMemo = saveMemo;
window.deleteSelectedMemo = deleteSelectedMemo;
window.confirmResetAll = confirmResetAll;
window.closeModal = closeModal;

// Calendar Module
window.changeCalendarMonth = (offset) => {
    import('../modules/calendar.js').then(m => m.changeCalendarMonth(offset));
};
window.selectToday = () => {
    import('../modules/calendar.js').then(m => m.selectToday());
};
window.changePlannerCalendarMonth = (offset) => {
    import('../modules/calendar.js').then(m => m.changePlannerCalendarMonth(offset));
};
window.selectPlannerToday = () => {
    import('../modules/calendar.js').then(m => m.selectPlannerToday());
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadData();
    initCalendarState();
    buildInputs();
    
    // Render all
    ['speech', 'planner', 'meal', 'sports', 'library'].forEach(renderTable);
    renderSpeechCalendar();
    updateSpeechStats();
    renderPlannerCalendar();
    updatePlannerStats();
});
