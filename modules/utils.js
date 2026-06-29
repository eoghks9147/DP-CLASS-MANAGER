import { state } from './storage.js';

export function showToast(message, variant = 'success') {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastText || !toastIcon) return;

    toastText.textContent = message;
    
    if (variant === 'alert') {
        toastIcon.setAttribute('data-lucide', 'alert-circle');
        toast.className = 'fixed bottom-6 right-6 z-50 bg-rose-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 transform translate-y-0 opacity-100 transition-all duration-300';
    } else {
        toastIcon.setAttribute('data-lucide', 'check-circle');
        toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 transform translate-y-0 opacity-100 transition-all duration-300';
    }
    lucide.createIcons();

    setTimeout(() => {
        toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300';
    }, 3000);
}

export function getTypeKoreanName(type) {
    const names = { speech: '발표 우수', planner: '플래너 검사', meal: '급식 도우미', sports: '체육 활동', library: '도서실 특별석' };
    return names[type] || '활동';
}

export function renderTable(type) {
    const tbody = document.getElementById(`${type}-table-body`);
    if (!tbody) return;
    tbody.innerHTML = '';

    state.studentDB.forEach(s => {
        const isRegistered = !!s.name;
        const nameText = isRegistered ? s.name : '<span class="text-slate-300 italic font-normal text-xs">DB 등록 필요</span>';
        const actData = state.activities[type][s.id] || { count: 0, dates: [] };

        if (type === 'speech') {
            const record = actData.dates.find(d => d.date === state.selectedSpeechDate) || { count: 0, memo: "" };
            const dailyCount = Number(record.count || 0);
            const dailyMemo = record.memo || "";

            const tr = document.createElement('tr');
            tr.className = `hover:bg-slate-50/80 transition ${!isRegistered ? 'opacity-60 bg-slate-50/40' : ''}`;
            tr.innerHTML = `
                <td class="p-3 font-semibold text-slate-400">${s.id}</td>
                <td class="p-3 font-bold text-slate-700">${nameText}</td>
                <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="adjustSpeechCount(${s.id}, -1)" ${!isRegistered || dailyCount === 0 ? 'disabled' : ''} 
                                class="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full font-extrabold text-slate-600 transition disabled:opacity-30 disabled:pointer-events-none">
                            -
                        </button>
                        <span class="font-extrabold text-sm text-slate-800 w-8 text-center bg-slate-50 border border-slate-200 py-1 rounded">
                            ${dailyCount}
                        </span>
                        <button onclick="adjustSpeechCount(${s.id}, 1)" ${!isRegistered ? 'disabled' : ''} 
                                class="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-full font-extrabold text-slate-600 transition disabled:opacity-30 disabled:pointer-events-none">
                            +
                        </button>
                    </div>
                </td>
                <td class="p-3">
                    <input type="text" value="${dailyMemo}" onchange="updateSpeechMemo(${s.id}, this.value)" ${!isRegistered ? 'disabled' : ''} 
                           placeholder="${isRegistered ? '발표 주제 및 세부 메모 입력 (입력 후 엔터 또는 바깥 클릭 시 저장)' : '학생 DB 등록이 필요합니다.'}" 
                           class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition disabled:opacity-50">
                </td>
                <td class="p-3 text-center font-extrabold text-indigo-600">
                    <span class="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded text-xs min-w-[2rem]">
                        ${actData.count}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        } 
        else if (type === 'planner') {
            const record = actData.dates.find(d => d.date === state.selectedPlannerDate) || { checkType: null, memo: "" };
            const currentCheckType = record.checkType; 
            const dailyMemo = record.memo || "";

            const tr = document.createElement('tr');
            tr.className = `hover:bg-slate-50/80 transition ${!isRegistered ? 'opacity-60 bg-slate-50/40' : ''}`;
            tr.innerHTML = `
                <td class="p-3 font-semibold text-slate-400">${s.id}</td>
                <td class="p-3 font-bold text-slate-700">${nameText}</td>
                <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="setPlannerCheckType(${s.id}, 'normal')" ${!isRegistered ? 'disabled' : ''} 
                                class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition duration-150 ${currentCheckType === 'normal' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'} disabled:opacity-30 disabled:pointer-events-none">
                            검사
                        </button>
                        <button onclick="setPlannerCheckType(${s.id}, 'special')" ${!isRegistered ? 'disabled' : ''} 
                                class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition duration-150 ${currentCheckType === 'special' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'} disabled:opacity-30 disabled:pointer-events-none">
                            특급검사
                        </button>
                    </div>
                </td>
                <td class="p-3">
                    <input type="text" value="${dailyMemo}" onchange="updatePlannerMemo(${s.id}, this.value)" ${!isRegistered ? 'disabled' : ''} 
                           placeholder="${isRegistered ? '일일 플래너 수행 상세 메모 입력 후 엔터' : '학생 DB 등록이 필요합니다.'}" 
                           class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition disabled:opacity-50">
                </td>
                <td class="p-3 text-center font-extrabold text-indigo-600">
                    <span class="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded text-xs min-w-[2rem]">
                        ${actData.count}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        }
        else {
            let datesHtml = '<span class="text-slate-400 text-xs">기록 없음</span>';
            if (actData.dates.length > 0) {
                datesHtml = actData.dates.map((d, index) => {
                    const dateVal = typeof d === 'object' ? d.date : d;
                    const memoVal = typeof d === 'object' ? (d.memo || '') : '';
                    const hasMemo = memoVal.trim().length > 0;

                    return `
                        <span class="relative bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs pl-2.5 pr-3 py-1.5 rounded-full border border-indigo-200 font-bold inline-flex items-center gap-1 select-none cursor-pointer transition ${hasMemo ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}"
                              onclick="openMemoModal('${type}', ${s.id}, ${index})">
                            <span>${dateVal}</span>
                            ${hasMemo ? `<i data-lucide="sticky-note" class="w-3 h-3 text-indigo-500 inline"></i>` : `<i data-lucide="plus" class="w-3 h-3 text-slate-400 inline"></i>`}
                        </span>
                    `;
                }).join(' ');
            }

            const tr = document.createElement('tr');
            tr.className = `hover:bg-slate-50/80 transition ${!isRegistered ? 'opacity-60 bg-slate-50/40' : ''}`;
            tr.innerHTML = `
                <td class="p-3 font-semibold text-slate-400">${s.id}</td>
                <td class="p-3 font-bold text-slate-700">${nameText}</td>
                <td class="p-3">
                    <button onclick="addLog('${type}', ${s.id})" ${!isRegistered ? 'disabled' : ''} 
                            class="p-1 px-3 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded text-xs font-bold text-slate-600 transition disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-600">
                        + 기록
                    </button>
                </td>
                <td class="p-3 text-center">
                    <span class="inline-block px-2 py-1 bg-slate-100 text-slate-800 rounded font-bold text-xs min-w-[2rem]">
                        ${actData.count}
                    </span>
                </td>
                <td class="p-3 gap-1.5 flex flex-wrap items-center">
                    ${datesHtml}
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
    lucide.createIcons();
}