import { state, saveData, recalculatePlannerTotalCount } from './storage.js';
import { showToast, renderTable } from './utils.js';
import { renderPlannerCalendar } from './calendar.js';

export function updatePlannerStats() {
    const dateTitleEl = document.getElementById('planner-selected-date-title');
    if (dateTitleEl) dateTitleEl.textContent = state.selectedPlannerDate;
    
    let uncheckStudents = [];
    
    state.studentDB.forEach(s => {
        if (!s.name) return; 
        
        const act = state.activities.planner[s.id];
        let isChecked = false;
        if (act && act.dates) {
            const record = act.dates.find(d => d.date === state.selectedPlannerDate);
            if (record && (record.checkType === 'normal' || record.checkType === 'special')) {
                isChecked = true;
            }
        }
        
        if (!isChecked) {
            uncheckStudents.push(s.name);
        }
    });
    
    const uncheckContainer = document.getElementById('planner-uncheck-students');
    if (uncheckContainer) {
        uncheckContainer.innerHTML = '';
        if (uncheckStudents.length > 0) {
            uncheckStudents.forEach(name => {
                const badge = document.createElement('span');
                badge.className = 'inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-rose-200 transition duration-150';
                badge.innerHTML = `<i data-lucide="user-x" class="w-3 h-3 text-rose-500"></i>${name}`;
                uncheckContainer.appendChild(badge);
            });
        } else {
            uncheckContainer.innerHTML = '<span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1.5 border border-emerald-200 rounded-md">모든 학생 플래너 검사 완료! 🎉</span>';
        }
    }
    lucide.createIcons();
}

export function setPlannerCheckType(studentId, type) {
    const student = state.studentDB.find(s => s.id === studentId);
    if (!student || !student.name) return;

    let act = state.activities.planner[studentId];
    let record = act.dates.find(d => d.date === state.selectedPlannerDate);

    if (!record) {
        record = { date: state.selectedPlannerDate, checkType: null, memo: "" };
        act.dates.push(record);
    }

    if (record.checkType === type) {
        record.checkType = null;
    } else {
        record.checkType = type;
    }

    if (record.checkType === null && (!record.memo || record.memo.trim() === '')) {
        const index = act.dates.indexOf(record);
        if (index > -1) act.dates.splice(index, 1);
    }

    recalculatePlannerTotalCount(studentId);
    saveData();
    renderTable('planner');
    renderPlannerCalendar();
    updatePlannerStats();
    showToast(`${student.name} 학생의 플래너 검사 상태를 갱신했습니다.`);
}

export function updatePlannerMemo(studentId, val) {
    const student = state.studentDB.find(s => s.id === studentId);
    if (!student || !student.name) return;

    let act = state.activities.planner[studentId];
    let record = act.dates.find(d => d.date === state.selectedPlannerDate);

    if (!record) {
        record = { date: state.selectedPlannerDate, checkType: null, memo: "" };
        act.dates.push(record);
    }

    record.memo = val.trim();

    if (record.checkType === null && record.memo.trim() === '') {
        const index = act.dates.indexOf(record);
        if (index > -1) act.dates.splice(index, 1);
    }

    recalculatePlannerTotalCount(studentId);
    saveData();
    renderTable('planner');
    renderPlannerCalendar();
    updatePlannerStats();
    showToast(`${student.name} 학생의 플래너 메모를 업데이트했습니다.`);
}