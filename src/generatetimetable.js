
const fs = require('fs');
const path = require('path');

// Load data dynamically from JSON file
function loadData() {
    const dataPath = path.join(__dirname, '../data/data.json');
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveTimetable(timetable) {
    const savePath = path.join(__dirname, '../routes/timetable.json');
    fs.writeFileSync(savePath, JSON.stringify(timetable, null, 2));
}

function generateEmptyWeek() {
    return {
        Monday: ["", "", "", "", "", ""],
        Tuesday: ["", "", "", "", "", ""],
        Wednesday: ["", "", "", "", "", ""],
        Thursday: ["", "", "", "", "", ""],
        Friday: ["", "", "", "", "", ""]
    };
}

function flattenWeek(weekObj) {
    return Object.keys(weekObj).flatMap(day => weekObj[day].map((slot, i) => ({ day, slotIndex: i })));
}

function generateTimetable() {
    const { subjects } = loadData();

    const timetable = generateEmptyWeek();
    const flatSlots = flattenWeek(timetable);

    // Convert subjects into an assignable list
    const tasks = [];
    subjects.forEach(sub => {
        for (let i = 0; i < sub.hoursPerWeek; i++) {
            tasks.push({ name: sub.name, teacher: sub.teacher });
        }
    });

    // Shuffle tasks to avoid bias
    tasks.sort(() => Math.random() - 0.5);

    const teacherSchedule = {};

    function isTeacherBusy(teacher, day, slotIndex) {
        const key = `${day}-${slotIndex}`;
        return teacherSchedule[key] && teacherSchedule[key].includes(teacher);
    }

    function assignTeacher(teacher, day, slotIndex) {
        const key = `${day}-${slotIndex}`;
        if (!teacherSchedule[key]) teacherSchedule[key] = [];
        teacherSchedule[key].push(teacher);
    }

    // Fill timetable
    let slotPointer = 0;

    for (const task of tasks) {
        let placed = false;

        while (!placed && slotPointer < flatSlots.length) {
            const { day, slotIndex } = flatSlots[slotPointer];

            if (!isTeacherBusy(task.teacher, day, slotIndex)) {
                timetable[day][slotIndex] = task.name;
                assignTeacher(task.teacher, day, slotIndex);
                placed = true;
            }
            slotPointer++;
        }

        if (!placed) {
            throw new Error(`Could not place subject ${task.name}. Not enough valid slots.`);
        }
    }

    saveTimetable(timetable);
    return timetable;
}

module.exports = generateTimetable;