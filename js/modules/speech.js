import { state, saveData, recalculateSpeechTotalCount } from './storage.js';
import { showToast, renderTable } from './utils.js';
import { renderSpeechCalendar } from './calendar.js';

export function updateSpeechStats() {
    const selectedDateTitleEl = document.getElementById('selected-date-title');
    if (selectedDateTitleEl) selectedDateTitleEl.textContent = state.selectedSpeechDate;
    
    let totalSpeechCount = 0;
    let activeStudentCount = 0;
    let highFrequencyStudents = [];
    
    state.studentDB.forEach(s => {
        const act = state.activities.speech[s.id];
        if (act && act.dates) {
            const record = act.dates.find(d => d.date === state.selectedSpeechDate);
            if (record) {
                const countVal = Number(record.count || 0);
                if (countVal > 0) {
                    totalSpeechCount += countVal;
                    activeStudentCount++;
                    
                    if (countVal >= 2 && s.name) {
                        highFrequencyStudents.push({ name: s.name, count: countVal });
                    }
                }
            }
        }
    });

    const highFreqContainer = document.getElementById('stat-high-frequency-students');
    if (highFreqContainer) {
        highFreqContainer.innerHTML = '';
        if (highFrequencyStudents.length > 0) {
            highFrequencyStudents.forEach(item => {
                const badge = document.createElement('span');
                badge.className = 'inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-200 transition animate-fade-in';
                badge.innerHTML = `<i data-lucide="zap" class="w-3 h-3 text-rose-500"></i>${item.name} (${item.count}회)`;
                highFreqContainer.appendChild(badge);
            });
        } else {
            highFreqContainer.innerHTML = '<span class="text-xs text-slate-300 italic">현재 대상자 없음</span>';
        }
    }

    calculateWeeklyLeaderboard();
    lucide.createIcons();
}

export function calculateWeeklyLeaderboard() {
    if (!state.selectedSpeechDate) return;
    
    const parts = state.selectedSpeechDate.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const day = date.getDay();
    
    const mondayDiff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayDiff);

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        weekDates.push(`${yyyy}-${mm}-${dd}`);
    }

    const rangeText = `${weekDates[0].substring(5)} ~ ${weekDates[4].substring(5)}`;
    const rangeEl = document.getElementById('stat-week-range');
    if (rangeEl) rangeEl.textContent = rangeText;

    const weeklyRanking = [];
    state.studentDB.forEach(s => {
        if (!s.name) return;
        let sum = 0;
        const act = state.activities.speech[s.id];
        if (act && act.dates) {
            act.dates.forEach(d => {
                if (weekDates.includes(d.date)) {
                    sum += Number(d.count || 0);
                }
            });
        }
        if (sum > 0) {
            weeklyRanking.push({ name: s.name, id: s.id, count: sum });
        }
    });

    weeklyRanking.sort((a, b) => b.count - a.count || a.id - b.id);

    const rankingEl = document.getElementById('stat-weekly-ranking');
    if (rankingEl) {
        rankingEl.innerHTML = '';
        if (weeklyRanking.length > 0) {
            weeklyRanking.slice(0, 5).forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between py-1 border-b border-slate-50 last:border-0';
                
                let rankBadgeStyle = 'text-slate-500 bg-slate-100';
                if (index === 0) rankBadgeStyle = 'text-amber-800 bg-amber-50 border border-amber-200 font-bold';
                else if (index === 1) rankBadgeStyle = 'text-slate-700 bg-slate-100 border border-slate-300 font-bold';
                else if (index === 2) rankBadgeStyle = 'text-amber-900 bg-orange-50/70 border border-orange-100';

                li.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${rankBadgeStyle}">
                            ${index + 1}
                        </span>
                        <span class="font-bold text-slate-700">${item.name}</span>
                    </div>
                    <span class="font-extrabold text-indigo-600">${item.count}회</span>
                `;
                rankingEl.appendChild(li);
            });
        } else {
            rankingEl.innerHTML = '<li class="text-xs text-slate-300 italic py-1 text-center">이번 주 등록 기록 없음</li>';
        }
    }
}

export function adjustSpeechCount(studentId, delta) {
    const student = state.studentDB.find(s => s.id === studentId);
    if (!student || !student.name) return;

    let act = state.activities.speech[studentId];
    let record = act.dates.find(d => d.date === state.selectedSpeechDate);

    if (!record) {
        if (delta < 0) return;
        record = { date: state.selectedSpeechDate, count: 0, memo: "" };
        act.dates.push(record);
    }

    record.count = Number(record.count || 0) + delta;

    if (record.count < 0) {
        record.count = 0;
    }

    if (record.count === 0 && (!record.memo || record.memo.trim() === '')) {
        const index = act.dates.indexOf(record);
        if (index > -1) act.dates.splice(index, 1);
    }

    recalculateSpeechTotalCount(studentId);
    saveData();
    renderTable('speech');
    renderSpeechCalendar();
    updateSpeechStats();
    showToast(`${student.name} 발표 상태를 갱신했습니다.`);
}

export function updateSpeechMemo(studentId, val) {
    const student = state.studentDB.find(s => s.id === studentId);
    if (!student || !student.name) return;

    let act = state.activities.speech[studentId];
    let record = act.dates.find(d => d.date === state.selectedSpeechDate);

    if (!record) {
        record = { date: state.selectedSpeechDate, count: 0, memo: "" };
        act.dates.push(record);
    }

    record.memo = val.trim();

    if (Number(record.count || 0) === 0 && record.memo.trim() === '') {
        const index = act.dates.indexOf(record);
        if (index > -1) act.dates.splice(index, 1);
    }

    recalculateSpeechTotalCount(studentId);
    saveData();
    renderTable('speech');
    renderSpeechCalendar();
    updateSpeechStats();
    showToast(`${student.name} 학생의 메모를 업데이트했습니다.`);
}