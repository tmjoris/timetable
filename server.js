const express = require("express");
const path = require("path");
const fs = require("fs");
const hbs = require("hbs");
const generateTimetable = require("./src/generatetimetable");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Register JSON helper for Handlebars
hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

// Helper functions
function loadTimetable() {
    try {
        const timetablePath = path.join(__dirname, "routes", "timetable.json");
        if (fs.existsSync(timetablePath)) {
            return JSON.parse(fs.readFileSync(timetablePath, "utf-8"));
        }
    } catch (error) {
        console.error("Error loading timetable:", error);
    }
    return null;
}

function loadData() {
    const dataPath = path.join(__dirname, "data", "data.json");
    return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

function saveTimetable(timetable) {
    const savePath = path.join(__dirname, "routes", "timetable.json");
    fs.writeFileSync(savePath, JSON.stringify(timetable, null, 2));
}

// Routes
app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/timetable", (req, res) => {
    const timetable = loadTimetable();
    const data = loadData();
    res.render("timetable", { 
        timetable: timetable || {}, 
        hasData: !!timetable,
        subjects: data.subjects 
    });
});

app.post("/generate", (req, res) => {
    try {
        const timetable = generateTimetable();
        res.json({ success: true, timetable });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post("/save", (req, res) => {
    try {
        saveTimetable(req.body.timetable);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post("/validate", (req, res) => {
    try {
        const { timetable } = req.body;
        const data = loadData();
        const validation = validateTimetable(timetable, data.subjects);
        res.json(validation);
    } catch (error) {
        res.json({ valid: false, errors: [error.message] });
    }
});

function validateTimetable(timetable, subjects) {
    const errors = [];
    const subjectCounts = {};
    const teacherSchedule = {};

    // Initialize subject counts
    subjects.forEach(sub => {
        subjectCounts[sub.name] = 0;
    });

    // Count occurrences and check teacher conflicts
    Object.keys(timetable).forEach(day => {
        timetable[day].forEach((subject, slotIndex) => {
            if (subject) {
                subjectCounts[subject]++;

                // Find teacher for this subject
                const subjectData = subjects.find(s => s.name === subject);
                if (subjectData) {
                    const key = `${day}-${slotIndex}`;
                    if (!teacherSchedule[key]) {
                        teacherSchedule[key] = [];
                    }
                    
                    if (teacherSchedule[key].includes(subjectData.teacher)) {
                        errors.push(`Teacher ${subjectData.teacher} has a conflict on ${day} slot ${slotIndex + 1}`);
                    }
                    teacherSchedule[key].push(subjectData.teacher);
                }
            }
        });
    });

    // Check if hours per week match
    subjects.forEach(sub => {
        if (subjectCounts[sub.name] !== sub.hoursPerWeek) {
            errors.push(`${sub.name} should have ${sub.hoursPerWeek} hours but has ${subjectCounts[sub.name]}`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});