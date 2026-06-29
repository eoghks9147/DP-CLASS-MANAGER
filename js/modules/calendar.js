import { state } from './storage.js';
import { renderTable } from './utils.js';
import { updateSpeechStats } from './speech.js';
import { updatePlannerStats } from './planner.js';

// 발표용 달력 그리기
export function renderSpeechCalendar() {
    const container = document.getElementById('calendar-days-grid');
    if (!container) return;
    container.innerHTML = '';
    
    document.getElementById('calendar-month-year').textContent = `${state.currentCalendarYear}년 ${String(state.currentCalendarMonth + 1).padStart(2, '0')}월`;
    
    const firstDayIndex = new Date(state.currentCalendarYear, state.currentCalendarMonth, 1).getDay();
    const totalDays = new Date(state.currentCalendarYear, state.currentCalendarMonth + 1, 0).getDate();
    const prevTotalDays = new Date(state.currentCalendarYear, state.currentCalendarMonth, 0).getDate();
    
    const daysWithRecords = new Set();
    state.studentDB.forEach(s => {
        const act = state.activities.speech[s.id];
        if (act && act.dates) {
            act.dates.forEach(d => {
                const targetPrefix = `${state.currentCalendarYear}-${String(state.currentCalendarMonth + 1).padStart(2, '0')}-`;
                if (d.date && d.date.startsWith(targetPrefix) && Number(d.count || 0) > 0) {
                    const dayNum = parseInt(d.date.split('-')[2], 10);
                    daysWithRecords.add(dayNum);
                }
            });
        }
    });

    for (let i = firstDayIndex; i > 0; i--) {
        const day = prevTotalDays - i + 1;
        const blank = document.createElement('div');
        blank.className = 'text-slate-700 text-xs p-2 select-none pointer-events-none opacity-20';
        blank.textContent = day;
        container.appendChild(blank);
    }
    
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${state.currentCalendarYear}-${String(state.currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = (dateStr === state.selectedSpeechDate);
        const isToday = (dateStr === todayStr);
        const hasAct = daysWithRecords.has(day);
        
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.onclick = () => selectSpeechDate(state.currentCalendarYear, state.currentCalendarMonth, day);
        
        let themeClass = 'hover:bg-slate-800 text-slate-300';
        if (isSelected) {
            themeClass = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm';
        } else if (isToday) {
            themeClass = 'border border-indigo-500 text-indigo-400 hover:bg-slate-800';
        }
        
        dayBtn.className = `p-1.5 rounded-lg transition duration-150 flex flex-col items-center justify-center relative cursor-pointer ${themeClass}`;
        
        const numSpan = document.createElement('span');
        numSpan.textContent = day;
        dayBtn.appendChild(numSpan);
        
        if (hasAct) {
            const dot = document.createElement('span');
            dot.className = `w-1.5 h-1.5 rounded-full mt-0.5 inline-block ${isSelected ? 'bg-white' : 'bg-indigo-400 animate-pulse'}`;
            dayBtn.appendChild(dot);
        } else {
            const emptyDot = document.createElement('span');
            emptyDot.className = 'w-1.5 h-1.5 mt-0.5 inline-block';
            dayBtn.appendChild(emptyDot);
        }
        
        container.appendChild(dayBtn);
    }
}

export function changeCalendarMonth(offset) {
    state.currentCalendarMonth += offset;
    if (state.currentCalendarMonth < 0) {
        state.currentCalendarMonth = 11;
        state.currentCalendarYear--;
    } else if (state.currentCalendarMonth > 11) {
        state.currentCalendarMonth = 0;
        state.currentCalendarYear++;
    }
    renderSpeechCalendar();
}

export function selectSpeechDate(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    state.selectedSpeechDate = `${year}-${mm}-${dd}`;
    
    renderSpeechCalendar();
    renderTable('speech');
    updateSpeechStats();
}

export function selectToday() {
    const today = new Date();
    state.currentCalendarYear = today.getFullYear();
    state.currentCalendarMonth = today.getMonth();
    const mm = String(state.currentCalendarMonth + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    state.selectedSpeechDate = `${state.currentCalendarYear}-${mm}-${dd}`;
    
    renderSpeechCalendar();
    renderTable('speech');
    updateSpeechStats();
}

// 플래너용 달력 그리기
export function renderPlannerCalendar() {
    const container = document.getElementById('planner-calendar-days-grid');
    if (!container) return;
    container.innerHTML = '';
    
    document.getElementById('planner-calendar-month-year').textContent = `${state.currentPlannerCalendarYear}년 ${String(state.currentPlannerCalendarMonth + 1).padStart(2, '0')}월`;
    
    const firstDayIndex = new Date(state.currentPlannerCalendarYear, state.currentPlannerCalendarMonth, 1).getDay();
    const totalDays = new Date(state.currentPlannerCalendarYear, state.currentPlannerCalendarMonth + 1, 0).getDate();
    const prevTotalDays = new Date(state.currentPlannerCalendarYear, state.currentPlannerCalendarMonth, 0).getDate();
    
    const daysWithRecords = new Set();
    state.studentDB.forEach(s => {
        const act = state.activities.planner[s.id];
        if (act && act.dates) {
            act.dates.forEach(d => {
                const targetPrefix = `${state.currentPlannerCalendarYear}-${String(state.currentPlannerCalendarMonth + 1).padStart(2, '0')}-`;
                if (d.date && d.date.startsWith(targetPrefix) && (d.checkType === 'normal' || d.checkType === 'special')) {
                    const dayNum = parseInt(d.date.split('-')[2], 10);
                    daysWithRecords.add(dayNum);
                }
            });
        }
    });

    for (let i = firstDayIndex; i > 0; i--) {
        const day = prevTotalDays - i + 1;
        const blank = document.createElement('div');
        blank.className = 'text-slate-700 text-xs p-2 select-none pointer-events-none opacity-20';
        blank.textContent = day;
        container.appendChild(blank);
    }
    
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${state.currentPlannerCalendarYear}-${String(state.currentPlannerCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = (dateStr === state.selectedPlannerDate);
        const isToday = (dateStr === todayStr);
        const hasAct = daysWithRecords.has(day);
        
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.onclick = () => selectPlannerDate(state.currentPlannerCalendarYear, state.currentPlannerCalendarMonth, day);
        
        let themeClass = 'hover:bg-slate-800 text-slate-300';
        if (isSelected) {
            themeClass = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm';
        } else if (isToday) {
            themeClass = 'border border-indigo-500 text-indigo-400 hover:bg-slate-800';
        }
        
        dayBtn.className = `p-1.5 rounded-lg transition duration-150 flex flex-col items-center justify-center relative cursor-pointer ${themeClass}`;
        
        const numSpan = document.createElement('span');
        numSpan.textContent = day;
        dayBtn.appendChild(numSpan);
        
        if (hasAct) {
            const dot = document.createElement('span');
            dot.className = `w-1.5 h-1.5 rounded-full mt-0.5 inline-block ${isSelected ? 'bg-white' : 'bg-emerald-400 animate-pulse'}`;
            dayBtn.appendChild(dot);
        } else {
            const emptyDot = document.createElement('span');
            emptyDot.className = 'w-1.5 h-1.5 mt-0.5 inline-block';
            dayBtn.appendChild(emptyDot);
        }
        
        container.appendChild(dayBtn);
    }
}

export function changePlannerCalendarMonth(offset) {
    state.currentPlannerCalendarMonth += offset;
    if (state.currentPlannerCalendarMonth < 0) {
        state.currentPlannerCalendarMonth = 11;
        state.currentPlannerCalendarYear--;
    } else if (state.currentPlannerCalendarMonth > 11) {
        state.currentPlannerCalendarMonth = 0;
        state.currentPlannerCalendarYear++;
    }
    renderPlannerCalendar();
}

export function selectPlannerDate(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    state.selectedPlannerDate = `${year}-${mm}-${dd}`;
    
    renderPlannerCalendar();
    renderTable('planner');
    updatePlannerStats();
}

export function selectPlannerToday() {
    const today = new Date();
    state.currentPlannerCalendarYear = today.getFullYear();
    state.currentPlannerCalendarMonth = today.getMonth();
    const mm = String(state.currentPlannerCalendarMonth + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    state.selectedPlannerDate = `${state.currentPlannerCalendarYear}-${mm}-${dd}`;
    
    renderPlannerCalendar();
    renderTable('planner');
    updatePlannerStats();
}

// 초기화 시 필요한 기본 날짜 설정
export function initCalendarState() {
    const today = new Date();
    state.currentCalendarYear = today.getFullYear();
    state.currentCalendarMonth = today.getMonth();
    const mm = String(state.currentCalendarMonth + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    state.selectedSpeechDate = `${state.currentCalendarYear}-${mm}-${dd}`;

    state.currentPlannerCalendarYear = today.getFullYear();
    state.currentPlannerCalendarMonth = today.getMonth();
    state.selectedPlannerDate = `${state.currentPlannerCalendarYear}-${mm}-${dd}`;
}