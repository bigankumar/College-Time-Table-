/* ============================================================
   GLOBAL VARIABLES
   ============================================================ */
let userRole = null;
let currentUser = null;

let classes = [];
let tasks = [];  // Only admin uses this
let notes = "";  // Only admin uses this

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/* ============================================================
   INITIAL SAMPLE DATA (LOADED ONLY 1 TIME)
   ============================================================ */
function loadSampleDataIfNeeded() {
    if (!localStorage.getItem("sampleLoaded")) {
        classes = [
            {
                id: 1,
                name: "Data Structures",
                day: "Monday",
                start: "10:00",
                end: "11:00",
                teacher: "Dr. Smith",
                room: "Lab 301",
                type: "Lecture",
                extra: false
            },
            {
                id: 2,
                name: "DBMS",
                day: "Tuesday",
                start: "11:00",
                end: "12:00",
                teacher: "Prof. Sharma",
                room: "Room 204",
                type: "Lecture",
                extra: false
            },
            {
                id: 3,
                name: "Computer Networks",
                day: "Wednesday",
                start: "09:00",
                end: "10:00",
                teacher: "Dr. Rao",
                room: "Room 110",
                type: "Lecture",
                extra: false
            }
        ];

        localStorage.setItem("timetableClasses", JSON.stringify(classes));
        localStorage.setItem("sampleLoaded", "true");
    }
}

/* ============================================================
   LOCAL STORAGE LOAD/SAVE
   ============================================================ */
function loadData() {
    const saved = localStorage.getItem("timetableClasses");
    if (saved) classes = JSON.parse(saved);
}

function saveData() {
    localStorage.setItem("timetableClasses", JSON.stringify(classes));
}

/* ============================================================
   NAVIGATION BETWEEN LOGIN BOXES
   ============================================================ */
function hideAllLogin() {
    document.querySelectorAll(".center-box").forEach(b => b.classList.add("hidden"));
}

function openStudentReg() { hideAllLogin(); document.getElementById("studentReg").classList.remove("hidden"); }
function openStudentLogin() { hideAllLogin(); document.getElementById("studentLogin").classList.remove("hidden"); }

function openTeacherReg() { hideAllLogin(); document.getElementById("teacherReg").classList.remove("hidden"); }
function openTeacherLogin() { hideAllLogin(); document.getElementById("teacherLogin").classList.remove("hidden"); }

function adminDirectLogin() { hideAllLogin(); document.getElementById("adminLogin").classList.remove("hidden"); }

/* ============================================================
   STUDENT REGISTER / LOGIN
   ============================================================ */
function registerStudent() {
    let name = stuName.value.trim();
    let email = stuEmail.value.trim();
    if (!name || !email) return alert("Please fill all fields.");

    localStorage.setItem("student", JSON.stringify({ name, email }));
    alert("Student registered successfully!");
    openStudentLogin();
}

function studentLoginNow() {
    let email = stuEmailLogin.value.trim();
    let student = JSON.parse(localStorage.getItem("student") || "{}");

    if (student.email === email) {
        currentUser = student;
        loadApp("student");
    } else {
        alert("Student not registered.");
    }
}

/* ============================================================
   TEACHER REGISTER / LOGIN
   ============================================================ */
function registerTeacher() {
    let name = teachName.value.trim();
    let email = teachEmail.value.trim();
    if (!name || !email) return alert("Please fill all fields.");

    localStorage.setItem("teacher", JSON.stringify({ name, email }));
    alert("Teacher registered successfully!");
    openTeacherLogin();
}

function teacherLoginNow() {
    let email = teachEmailLogin.value.trim();
    let teacher = JSON.parse(localStorage.getItem("teacher") || "{}");

    if (teacher.email === email) {
        currentUser = teacher;
        loadApp("teacher");
    } else {
        alert("Teacher not registered.");
    }
}

/* ============================================================
   ADMIN LOGIN
   ============================================================ */
function adminLoginNow() {
    let email = adminEmail.value.trim();
    let pass = adminPass.value.trim();

    if (email === "admin@gmail.com" && pass === "admin123") {
        currentUser = { email };
        loadApp("admin");
    } else {
        alert("Incorrect admin credentials.");
    }
}

/* ============================================================
   LOAD APP AFTER LOGIN
   ============================================================ */
function loadApp(role) {
    userRole = role;
    loadSampleDataIfNeeded();
    loadData();

    hideAllLogin();
    document.getElementById("app").style.display = "block";

    document.getElementById("loggedUser").innerText = currentUser.email;

    updateClock();
    setInterval(updateClock, 1000);

    if (role === "student") setupStudentView();
    if (role === "teacher") setupTeacherView();
    if (role === "admin") setupAdminView();

    showNotification("Logged in as " + role.toUpperCase());
}

function logout() {
    location.reload();
}

/* ============================================================
   CLOCK
   ============================================================ */
function updateClock() {
    let now = new Date();
    document.getElementById("currentTime").innerText =
        now.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}

/* ============================================================
   STUDENT VIEW SETUP
   ============================================================ */
function setupStudentView() {
    document.getElementById("studentTabs").classList.remove("hidden");
    document.getElementById("studentView").classList.remove("hidden");

    showStudentToday();
}

/* ============================================================
   STUDENT TODAY CLASSES
   ============================================================ */
function showStudentToday() {
    switchTabs("studentTabs", 0);

    let today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    let todayClasses = classes
        .filter(c => c.day === today)
        .sort((a, b) => a.start.localeCompare(b.start));

    studentTodayArea.classList.remove("hidden");
    studentWeekArea.classList.add("hidden");

    if (todayClasses.length === 0) {
        studentTodayList.innerHTML = `<p>No classes today.</p>`;
    } else {
        studentTodayList.innerHTML = todayClasses.map(renderClass).join("");
    }
}

/* ============================================================
   STUDENT WEEK SECTION
   ============================================================ */
function showStudentWeek() {
    switchTabs("studentTabs", 1);

    studentTodayArea.classList.add("hidden");
    studentWeekArea.classList.remove("hidden");

    renderWeekButtons("weekDaysButtons", "selectedDayArea", "selectedDayTitle", "selectedDayContent");
}

/* ============================================================
   RENDER WEEK BUTTONS
   ============================================================ */
function renderWeekButtons(containerID, areaID, titleID, contentID) {
    let container = document.getElementById(containerID);
    container.innerHTML = "";

    weekDays.forEach(day => {
        let count = classes.filter(c => c.day === day).length;

        let btn = `
            <button class="week-btn" onclick="loadWeekDay('${day}','${areaID}','${titleID}','${contentID}')">
                <strong>${day}</strong> (${count})
            </button>
        `;

        container.innerHTML += btn;
    });
}

/* ============================================================
   SELECT A DAY IN WEEK
   ============================================================ */
function loadWeekDay(day, areaID, titleID, contentID) {
    let today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    let area = document.getElementById(areaID);
    let title = document.getElementById(titleID);
    let content = document.getElementById(contentID);

    title.innerText = day;
    area.classList.remove("hidden");

    if (weekDays.indexOf(day) < weekDays.indexOf(today)) {
        content.innerHTML = `<p>All ${day} classes are over. Wait for next week.</p>`;
        return;
    }

    if (day === today) {
        content.innerHTML = classes.filter(c => c.day === day).map(renderClass).join("");
        return;
    }

    let list = classes.filter(c => c.day === day);

    if (list.length === 0) {
        content.innerHTML = `<p>No classes scheduled on this day.</p>`;
        return;
    }

    content.innerHTML = list.map(renderClass).join("");
}

/* ============================================================
   TEACHER VIEW SETUP
   ============================================================ */
function setupTeacherView() {
    document.getElementById("teacherTabs").classList.remove("hidden");
    document.getElementById("teacherView").classList.remove("hidden");

    renderExtraClassDayOptions();
    showTeacherToday();
}

/* ============================================================
   TEACHER TODAY
   ============================================================ */
function showTeacherToday() {
    switchTabs("teacherTabs", 0);

    teacherTodayArea.classList.remove("hidden");
    teacherWeekArea.classList.add("hidden");
    extraClassArea.classList.add("hidden");

    let today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    let todayClasses = classes.filter(c => c.day === today);
    teacherTodayList.innerHTML = todayClasses.length
        ? todayClasses.map(renderClass).join("")
        : "<p>No classes today.</p>";
}

/* ============================================================
   TEACHER WEEK
   ============================================================ */
function showTeacherWeek() {
    switchTabs("teacherTabs", 1);

    teacherTodayArea.classList.add("hidden");
    teacherWeekArea.classList.remove("hidden");
    extraClassArea.classList.add("hidden");

    renderWeekButtons(
        "teacherWeekButtons",
        "teacherSelectedDayArea",
        "teacherSelectedDayTitle",
        "teacherSelectedDayContent"
    );
}

/* ============================================================
   TEACHER EXTRA CLASS
   ============================================================ */
function openExtraClass() {
    switchTabs("teacherTabs", 2);

    teacherTodayArea.classList.add("hidden");
    teacherWeekArea.classList.add("hidden");
    extraClassArea.classList.remove("hidden");
}

function renderExtraClassDayOptions() {
    let today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    extraClassDay.innerHTML = "";

    weekDays.forEach(day => {
        if (weekDays.indexOf(day) > weekDays.indexOf(today)) {
            extraClassDay.innerHTML += `<option>${day}</option>`;
        }
    });
}

function saveExtraClass() {
    let today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    let day = extraClassDay.value;
    if (!day || weekDays.indexOf(day) <= weekDays.indexOf(today)) {
        alert("Extra classes can only be added to future days.");
        return;
    }

    let newClass = {
        id: Date.now(),
        name: extraClassName.value,
        day,
        start: extraStartTime.value,
        end: extraEndTime.value,
        teacher: currentUser.name,
        room: extraRoom.value,
        type: extraType.value,
        extra: true
    };

    classes.push(newClass);
    saveData();
    showNotification("Extra class added.");

    extraClassName.value = "";
    extraStartTime.value = "";
    extraEndTime.value = "";
    extraRoom.value = "";
}

/* ============================================================
   ADMIN VIEW
   ============================================================ */
function setupAdminView() {
    document.getElementById("adminTabs").classList.remove("hidden");
    showAdminDashboard();
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function showAdminDashboard() {
    switchTabs("adminTabs", 0);

    adminDashboard.classList.remove("hidden");
    adminData.classList.add("hidden");

    renderAdminCharts();
}

function renderAdminCharts() {
    /* Classes per day */
    let chartHTML = weekDays.map(day => {
        let count = classes.filter(c => c.day === day).length;
        return `<p><strong>${day}</strong>: ${count}</p>`;
    }).join("");

    adminClassesChart.innerHTML = chartHTML;

    /* Class type distribution */
    let types = {};
    classes.forEach(c => { types[c.type] = (types[c.type] || 0) + 1; });

    adminTypeChart.innerHTML = Object.entries(types).map(
        ([type, count]) => `<p>${type}: ${count}</p>`
    ).join("");

    /* Upcoming class */
    let today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    let upcoming = classes.filter(c => c.day === today).sort((a, b) => a.start.localeCompare(b.start))[0];

    adminUpcoming.innerHTML = upcoming
        ? `<p>${upcoming.name} at ${upcoming.start}</p>`
        : `<p>No upcoming classes today.</p>`;
}

/* ============================================================
   ADMIN DATA PAGE
   ============================================================ */
function showAdminData() {
    switchTabs("adminTabs", 1);

    adminDashboard.classList.add("hidden");
    adminData.classList.remove("hidden");
}

/* ============================================================
   MODIFY CLASSES POPUP
   ============================================================ */
function openModifyClasses() {
    modifyPopup.classList.remove("hidden");

    modifyList.innerHTML = classes.map(c => `
        <div class="modify-item">
            <strong>${c.name}</strong> — ${c.day} (${c.start}-${c.end})
            <div class="modify-actions">
                <button class="m3-btn small secondary" onclick="editClass(${c.id})">Edit</button>
                <button class="m3-btn small danger" onclick="deleteClass(${c.id})">Delete</button>
            </div>
        </div>
    `).join("");
}

function closeModifyClasses() {
    modifyPopup.classList.add("hidden");
}

/* ============================================================
   ADD CLASS POPUP
   ============================================================ */
function openAddClassModal() {
    addClassPopup.classList.remove("hidden");
}

function closeAddClassModal() {
    addClassPopup.classList.add("hidden");
}

function saveNewClass() {
    let newClass = {
        id: Date.now(),
        name: newClassName.value,
        day: newClassDay.value,
        start: newStart.value,
        end: newEnd.value,
        teacher: newTeacher.value,
        room: newRoom.value,
        type: newType.value,
        extra: false
    };

    classes.push(newClass);
    saveData();
    closeAddClassModal();
    openModifyClasses();
    showNotification("Class added successfully.");
}

/* ============================================================
   EDIT / DELETE CLASS
   ============================================================ */
function editClass(id) {
    let c = classes.find(x => x.id === id);

    newClassName.value = c.name;
    newClassDay.value = c.day;
    newStart.value = c.start;
    newEnd.value = c.end;
    newTeacher.value = c.teacher;
    newRoom.value = c.room;
    newType.value = c.type;

    deleteClass(id);
    addClassPopup.classList.remove("hidden");
}

function deleteClass(id) {
    classes = classes.filter(c => c.id !== id);
    saveData();
    openModifyClasses();
    showNotification("Class removed.");
}

/* ============================================================
   EXPORT / IMPORT / RESET
   ============================================================ */
function exportData() {
    let data = {
        classes,
        tasks,
        notes
    };

    let blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "timetable_backup.json";
    a.click();
}

function importData() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = event => {
            try {
                let data = JSON.parse(event.target.result);
                classes = data.classes || [];
                tasks = data.tasks || [];
                notes = data.notes || "";

                saveData();
                showNotification("Data imported.");
                showAdminDashboard();
            } catch {
                alert("Invalid file.");
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

function clearAllData() {
    if (!confirm("Delete ALL data?")) return;

    localStorage.clear();
    location.reload();
}

/* ============================================================
   NOTIFICATION POPUP
   ============================================================ */
function showNotification(msg) {
    notification.innerText = msg;
    notification.classList.add("show");
    setTimeout(() => notification.classList.remove("show"), 2500);
}

/* ============================================================
   CLASS RENDERING TEMPLATE
   ============================================================ */
function renderClass(c) {
    return `
        <div class="class-item">
            <div class="class-title">${c.name}</div>
            <div class="class-time">${c.start} – ${c.end}</div>
            <div class="class-meta">${c.room ? "Room: " + c.room : ""} | ${c.type}</div>
        </div>
    `;
}

/* ============================================================
   TAB SWITCH LOGIC
   ============================================================ */
function switchTabs(tabContainerId, index) {
    let tabs = document.querySelectorAll(`#${tabContainerId} .tab`);
    tabs.forEach(t => t.classList.remove("active"));
    tabs[index].classList.add("active");
}
