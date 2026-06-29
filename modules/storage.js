export const state = {
    MAX_STUDENTS: 20,
    studentDB: [],
    activities: {
        speech: {},
        planner: {},
        meal: {},
        sports: {},
        library: {}
    },
    selectedSpeechDate: "",
    currentCalendarYear: 2026,
    currentCalendarMonth: 5,
    selectedPlannerDate: "",
    currentPlannerCalendarYear: 2026,
    currentPlannerCalendarMonth: 5,
    currentMemoTarget: null
};

export function loadData() {
    const savedDB = localStorage.getItem('school_db_students_2026');
    if (savedDB) {
        state.studentDB = JSON.parse(savedDB);
    } else {
        state.studentDB = Array.from({ length: state.MAX_STUDENTS }, (_, i) => ({ id: i + 1, name: '' }));
    }

    const savedActivities = localStorage.getItem('school_db_activities_2026');
    if (savedActivities) {
        state.activities = JSON.parse(savedActivities);
        if (!state.activities.planner) state.activities.planner = {};
    } else {
        state.activities = { speech: {}, planner: {}, meal: {}, sports: {}, library: {} };
    }

    state.studentDB.forEach(s => {
        if (!state.activities.speech[s.id]) {
            state.activities.speech[s.id] = { count: 0, dates: [] };
        } else {
            state.activities.speech[s.id].dates = state.activities.speech[s.id].dates.map(d => {
                if (typeof d === 'string') {
                    let formattedDate = d;
                    if (d.length === 5) formattedDate = `2026-${d}`;
                    return { date: formattedDate, count: 1, memo: "" };
                } else if (d && typeof d === 'object') {
                    let formattedDate = d.date || "";
                    if (formattedDate.length === 5) formattedDate = `2026-${formattedDate}`;
                    return { 
                        date: formattedDate, 
                        count: d.count !== undefined ? Number(d.count) : 1, 
                        memo: d.memo || "" 
                    };
                }
                return null;
            }).filter(Boolean);
            recalculateSpeechTotalCount(s.id);
        }

        if (!state.activities.planner[s.id]) {
            state.activities.planner[s.id] = { count: 0, dates: [] };
        } else {
            recalculatePlannerTotalCount(s.id);
        }

        ['meal', 'sports', 'library'].forEach(tab => {
            if (!state.activities[tab][s.id]) {
                state.activities[tab][s.id] = { count: 0, dates: [] };
            }
        });
    });
}

export function saveData() {
    localStorage.setItem('school_db_students_2026', JSON.stringify(state.studentDB));
    localStorage.setItem('school_db_activities_2026', JSON.stringify(state.activities));
}

export function recalculateSpeechTotalCount(studentId) {
    const act = state.activities.speech[studentId];
    if (!act) return;
    let total = 0;
    act.dates.forEach(d => {
        total += Number(d.count || 0);
    });
    act.count = total;
}

export function recalculatePlannerTotalCount(studentId) {
    const act = state.activities.planner[studentId];
    if (!act) return;
    let total = 0;
    act.dates.forEach(d => {
        if (d.checkType === 'normal' || d.checkType === 'special') {
            total += 1;
        }
    });
    act.count = total;
}