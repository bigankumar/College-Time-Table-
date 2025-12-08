// ========================================
// GLOBAL VARIABLES
// ========================================
let classes = [];
let currentUser = null;
let currentRole = 'student';
let selectedRole = 'student';

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadSampleData();
    loadUsers();
    updateTime();
    setInterval(updateTime, 1000);
    setInterval(checkUpcomingClasses, 30000);
}

function loadSampleData() {
    if (!localStorage.getItem('sampleLoaded_v2')) {
        classes = [
            {
                id: 1,
            name: "Data Structures",
            day: "Monday",
            start: "10:00",
            end: "11:00",
            teacher: "Dr. Sharma",
            room: "Lab 301",
            type: "Lecture",
            extra: false
        },
        {
            id: 2,
            name: "Database Management",
            day: "Tuesday",
            start: "11:00",
            end: "12:00",
            teacher: "Dr. Kumar",
            room: "Room 204",
            type: "Lecture",
            extra: false
        },
        {
            id: 3,
            name: "Web Development Lab",
            day: "Wednesday",
            start: "14:00",
            end: "16:00",
            teacher: "Prof. Singh",
            room: "Lab 102",
            type: "Lab",
            extra: false
        }
    ];
    saveClasses();
    localStorage.setItem('sampleLoaded_v2', 'true');
} else {
    loadClasses();
}
}

function loadUsers() {
const users = localStorage.getItem('timetableUsers');
if (!users) {
    localStorage.setItem('timetableUsers', JSON.stringify([]));
}
}

function loadClasses() {
const saved = localStorage.getItem('timetableClasses');
if (saved) {
    classes = JSON.parse(saved);
}
}

function saveClasses() {
localStorage.setItem('timetableClasses', JSON.stringify(classes));
}

function updateTime() {
const now = new Date();
const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
};
document.getElementById('currentTime').textContent = now.toLocaleDateString('en-US', options);
}

// ========================================
// LOGIN SYSTEM
// ========================================
function selectRole(role) {
selectedRole = role;
document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
event.target.classList.add('active');

// Hide register for admin
if (role === 'admin') {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}
}

function toggleForms() {
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
} else {
    if (selectedRole === 'admin') {
        showNotification('Admin cannot register!');
        return;
    }
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}
}

function handleRegister() {
const name = document.getElementById('registerName').value;
const email = document.getElementById('registerEmail').value;
const password = document.getElementById('registerPassword').value;

if (!name || !email || !password) {
    showNotification('Please fill all fields!');
    return;
}

const users = JSON.parse(localStorage.getItem('timetableUsers'));

if (users.find(u => u.email === email)) {
    showNotification('Email already registered!');
    return;
}

users.push({ name, email, password, role: selectedRole });
localStorage.setItem('timetableUsers', JSON.stringify(users));
showNotification('Registration successful! Please login.');
toggleForms();
}

function handleLogin() {
const email = document.getElementById('loginEmail').value;
const password = document.getElementById('loginPassword').value;

if (!email || !password) {
    showNotification('Please fill all fields!');
    return;
}

// Admin login
if (selectedRole === 'admin') {
    if (email === 'admin@gmail.com' && password === 'admin123') {
        currentUser = { name: 'Admin', email, role: 'admin' };
        currentRole = 'admin';
        showApp();
        showNotification('Welcome Admin!');
    } else {
        showNotification('Invalid admin credentials!');
    }
    return;
}

// Student/Teacher login
const users = JSON.parse(localStorage.getItem('timetableUsers'));
const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);

if (user) {
    currentUser = user;
    currentRole = user.role;
    showApp();
    showNotification(`Welcome ${user.name}!`);
} else {
    showNotification('Invalid credentials!');
}
}

function handleLogout() {
if (confirm('Are you sure you want to logout?')) {
    currentUser = null;
    currentRole = 'student';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('appContainer').classList.remove('show');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    showNotification('Logged out successfully!');
}
}

function showApp() {
document.getElementById('loginPage').style.display = 'none';
document.getElementById('appContainer').classList.add('show');
document.getElementById('userName').textContent = currentUser.name;
document.getElementById('userBadge').textContent = currentRole.toUpperCase();

// Show appropriate UI
document.getElementById('studentUI').style.display = 'none';
document.getElementById('teacherUI').style.display = 'none';
document.getElementById('adminUI').style.display = 'none';

if (currentRole === 'student') {
    document.getElementById('studentUI').style.display = 'block';
    renderStudentToday();
    renderStudentWeek();
} else if (currentRole === 'teacher') {
    document.getElementById('teacherUI').style.display = 'block';
    renderTeacherToday();
    populateExtraDays();
} else if (currentRole === 'admin') {
    document.getElementById('adminUI').style.display = 'block';
    renderAdminDashboard();
}

checkUpcomingClasses();
}

// ========================================
// STUDENT FUNCTIONS
// ========================================
function switchStudentTab(tab) {
document.querySelectorAll('#studentUI .tab').forEach(t => t.classList.remove('active'));
document.querySelectorAll('#studentUI .tab-content').forEach(c => c.classList.remove('active'));

event.target.classList.add('active');

if (tab === 'today') {
    document.getElementById('studentTodayTab').classList.add('active');
    renderStudentToday();
} else {
    document.getElementById('studentWeekTab').classList.add('active');
    renderStudentWeek();
}
}

function renderStudentToday() {
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const todayClasses = classes.filter(c => c.day === today).sort((a, b) => a.start.localeCompare(b.start));

const container = document.getElementById('studentTodayList');

if (todayClasses.length === 0) {
    container.innerHTML = '<div class="empty-state">📭 No classes today!</div>';
    return;
}

container.innerHTML = todayClasses.map(c => `
    <div class="class-item ${c.extra ? 'extra' : ''}">
        <div class="class-time">${c.start} - ${c.end}</div>
        <div class="class-name">${c.name} ${c.extra ? '⭐ EXTRA' : ''}</div>
        <div class="class-details">
            👨‍🏫 ${c.teacher} | 🚪 ${c.room} | 📚 ${c.type}
        </div>
    </div>
`).join('');
}

function renderStudentWeek() {
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

days.forEach(day => {
    const count = classes.filter(c => c.day === day).length;
    const el = document.getElementById(day.substring(0, 3).toLowerCase() + 'Count');
    if (el) el.textContent = `(${count})`;
});
}

function showStudentDay(day) {
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const todayIndex = days.indexOf(today);
const selectedIndex = days.indexOf(day);

document.querySelectorAll('#studentWeekTab .day-btn').forEach(btn => btn.classList.remove('active'));
event.target.classList.add('active');

const container = document.getElementById('studentDayList');
const dayClasses = classes.filter(c => c.day === day).sort((a, b) => a.start.localeCompare(b.start));

// Past day
if (selectedIndex < todayIndex) {
    container.innerHTML = '<div class="empty-state">⏰ All classes are over. Wait for next week.</div>';
    return;
}

// Today
if (day === today) {
    if (dayClasses.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 No classes today!</div>';
    } else {
        container.innerHTML = dayClasses.map(c => `
            <div class="class-item ${c.extra ? 'extra' : ''}">
                <div class="class-time">${c.start} - ${c.end}</div>
                <div class="class-name">${c.name} ${c.extra ? '⭐ EXTRA' : ''}</div>
                <div class="class-details">
                    👨‍🏫 ${c.teacher} | 🚪 ${c.room} | 📚 ${c.type}
                </div>
            </div>
        `).join('');
    }
    return;
}

// Future day
if (dayClasses.length === 0) {
    container.innerHTML = '<div class="empty-state">📭 No classes scheduled on this day.</div>';
} else {
    container.innerHTML = dayClasses.map(c => `
        <div class="class-item ${c.extra ? 'extra' : ''}">
            <div class="class-time">${c.start} - ${c.end}</div>
            <div class="class-name">${c.name} ${c.extra ? '⭐ EXTRA' : ''}</div>
            <div class="class-details">
                👨‍🏫 ${c.teacher} | 🚪 ${c.room} | 📚 ${c.type}
            </div>
        </div>
    `).join('');
}
}

// ========================================
// TEACHER FUNCTIONS
// ========================================
function switchTeacherTab(tab) {
document.querySelectorAll('#teacherUI .tab').forEach(t => t.classList.remove('active'));
document.querySelectorAll('#teacherUI .tab-content').forEach(c => c.classList.remove('active'));

event.target.classList.add('active');

if (tab === 'today') {
    document.getElementById('teacherTodayTab').classList.add('active');
    renderTeacherToday();
} else if (tab === 'week') {
    document.getElementById('teacherWeekTab').classList.add('active');
} else {
    document.getElementById('teacherExtraTab').classList.add('active');
    populateExtraDays();
}
}

function renderTeacherToday() {
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const todayClasses = classes.filter(c => c.day === today).sort((a, b) => a.start.localeCompare(b.start));

const container = document.getElementById('teacherTodayList');

if (todayClasses.length === 0) {
    container.innerHTML = '<div class="empty-state">📭 No classes today!</div>';
    return;
}

container.innerHTML = todayClasses.map(c => `
    <div class="class-item ${c.extra ? 'extra' : ''}">
        <div class="class-time">${c.start} - ${c.end}</div>
        <div class="class-name">${c.name} ${c.extra ? '⭐ EXTRA' : ''}</div>
        <div class="class-details">
            👨‍🏫 ${c.teacher} | 🚪 ${c.room} | 📚 ${c.type}
        </div>
    </div>
`).join('');
}

function showTeacherDay(day) {
document.querySelectorAll('#teacherWeekTab .day-btn').forEach(btn => btn.classList.remove('active'));
event.target.classList.add('active');

const container = document.getElementById('teacherDayList');
const dayClasses = classes.filter(c => c.day === day).sort((a, b) => a.start.localeCompare(b.start));

if (dayClasses.length === 0) {
    container.innerHTML = '<div class="empty-state">📭 No classes scheduled on this day.</div>';
} else {
    container.innerHTML = dayClasses.map(c => `
        <div class="class-item ${c.extra ? 'extra' : ''}">
            <div class="class-time">${c.start} - ${c.end}</div>
            <div class="class-name">${c.name} ${c.extra ? '⭐ EXTRA' : ''}</div>
            <div class="class-details">
                👨‍🏫 ${c.teacher} | 🚪 ${c.room} | 📚 ${c.type}
            </div>
        </div>
    `).join('');
}
}

function populateExtraDays() {
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const todayIndex = days.indexOf(today);

const select = document.getElementById('extraDay');
select.innerHTML = '<option value="">Select Day</option>';

for (let i = todayIndex + 1; i < days.length; i++) {
    select.innerHTML += `<option value="${days[i]}">${days[i]}</option>`;
}
}

document.getElementById('extraClassForm').addEventListener('submit', function(e) {
e.preventDefault();

const extraClass = {
    id: Date.now(),
    name: document.getElementById('extraName').value,
    day: document.getElementById('extraDay').value,
    start: document.getElementById('extraStart').value,
    end: document.getElementById('extraEnd').value,
    teacher: currentUser.name,
    room: document.getElementById('extraRoom').value,
    type: document.getElementById('extraType').value,
    extra: true
};

classes.push(extraClass);
saveClasses();
showNotification('Extra class added successfully!');
this.reset();
renderTeacherToday();
});

// ========================================
// ADMIN FUNCTIONS
// ========================================
function switchAdminTab(tab) {
document.querySelectorAll('#adminUI .tab').forEach(t => t.classList.remove('active'));
document.querySelectorAll('#adminUI .tab-content').forEach(c => c.classList.remove('active'));

event.target.classList.add('active');

if (tab === 'dashboard') {
    document.getElementById('adminDashboardTab').classList.add('active');
    renderAdminDashboard();
} else {
    document.getElementById('adminDataTab').classList.add('active');
}
}

function renderAdminDashboard() {
// Stats
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const todayClasses = classes.filter(c => c.day === today);

document.getElementById('totalClasses').textContent = classes.length;
document.getElementById('todayClasses').textContent = todayClasses.length;

const now = new Date();
const nextClass = todayClasses
    .filter(c => {
        const [h, m] = c.start.split(':');
        const classTime = new Date();
        classTime.setHours(parseInt(h), parseInt(m), 0);
        return classTime > now;
    })
    .sort((a, b) => a.start.localeCompare(b.start))[0];

document.getElementById('nextClass').textContent = nextClass ? nextClass.start : '--';

// Chart
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const counts = fullDays.map(day => classes.filter(c => c.day === day).length);
const maxCount = Math.max(...counts, 1);

const chart = document.getElementById('classChart');
chart.innerHTML = counts.map((count, i) => {
    const height = (count / maxCount) * 100;
    return `
        <div class="bar" style="height: ${height}%">
            <div class="bar-value">${count}</div>
            <div class="bar-label">${days[i]}</div>
        </div>
    `;
}).join('');
}

function openModifyModal() {
document.getElementById('modifyModal').classList.add('show');
renderClassList();
}

function closeModifyModal() {
document.getElementById('modifyModal').classList.remove('show');
document.getElementById('addClassForm').style.display = 'none';
}

function renderClassList() {
const container = document.getElementById('classList');
const sorted = [...classes].sort((a, b) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
    return dayDiff !== 0 ? dayDiff : a.start.localeCompare(b.start);
});

container.innerHTML = sorted.map(c => `
    <div class="class-list-item">
        <div>
            <strong>${c.name}</strong> - ${c.day} (${c.start} - ${c.end})
            <br><small>${c.teacher} | ${c.room} ${c.extra ? '⭐ EXTRA' : ''}</small>
        </div>
        <div class="btn-group">
            <button class="btn-small btn-edit" onclick="editClass(${c.id})">Edit</button>
            <button class="btn-small btn-delete" onclick="deleteClass(${c.id})">Delete</button>
        </div>
    </div>
`).join('');
}

function showAddClassForm() {
const form = document.getElementById('addClassForm');
form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addNewClass() {
const newClass = {
    id: Date.now(),
    name: document.getElementById('newClassName').value,
    day: document.getElementById('newClassDay').value,
    start: document.getElementById('newClassStart').value,
    end: document.getElementById('newClassEnd').value,
    teacher: document.getElementById('newClassTeacher').value,
    room: document.getElementById('newClassRoom').value,
    type: document.getElementById('newClassType').value,
    extra: false
};

if (!newClass.name || !newClass.start || !newClass.end || !newClass.teacher || !newClass.room) {
    showNotification('Please fill all fields!');
    return;
}

classes.push(newClass);
saveClasses();
showNotification('Class added successfully!');
renderClassList();
renderAdminDashboard();
document.getElementById('addClassForm').style.display = 'none';

// Clear form
document.getElementById('newClassName').value = '';
document.getElementById('newClassStart').value = '';
document.getElementById('newClassEnd').value = '';
document.getElementById('newClassTeacher').value = '';
document.getElementById('newClassRoom').value = '';
}

function editClass(id) {
const cls = classes.find(c => c.id === id);
if (!cls) return;

document.getElementById('newClassName').value = cls.name;
document.getElementById('newClassDay').value = cls.day;
document.getElementById('newClassStart').value = cls.start;
document.getElementById('newClassEnd').value = cls.end;
document.getElementById('newClassTeacher').value = cls.teacher;
document.getElementById('newClassRoom').value = cls.room;
document.getElementById('newClassType').value = cls.type;

deleteClass(id);
document.getElementById('addClassForm').style.display = 'block';
showNotification('Edit the class and click Add Class');
}

function deleteClass(id) {
if (!confirm('Delete this class?')) return;

classes = classes.filter(c => c.id !== id);
saveClasses();
showNotification('Class deleted!');
renderClassList();
renderAdminDashboard();
}

function exportData() {
const data = {
    classes: classes,
    users: JSON.parse(localStorage.getItem('timetableUsers'))
};
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'timetable_backup.json';
a.click();
showNotification('Data exported successfully!');
}

function importData() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
        try {
            const data = JSON.parse(event.target.result);
            if (confirm('This will replace all current data. Continue?')) {
                classes = data.classes || [];
                if (data.users) {
                    localStorage.setItem('timetableUsers', JSON.stringify(data.users));
                }
                saveClasses();
                showNotification('Data imported successfully!');
                renderAdminDashboard();
                renderClassList();
            }
        } catch (err) {
            showNotification('Invalid file format!');
        }
    };
    reader.readAsText(file);
};
input.click();
}

function resetAllData() {
if (!confirm('Delete ALL data? This cannot be undone!')) return;
if (!confirm('Are you REALLY sure?')) return;

localStorage.clear();
classes = [];
showNotification('All data cleared!');
setTimeout(() => location.reload(), 1500);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function checkUpcomingClasses() {
if (currentRole === 'student' || currentRole === 'teacher') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = classes.filter(c => c.day === today);
    const now = new Date();

    const upcoming = todayClasses.find(c => {
        const [h, m] = c.start.split(':');
        const classTime = new Date();
        classTime.setHours(parseInt(h), parseInt(m), 0);
        const diff = classTime - now;
        return diff > 0 && diff <= 15 * 60 * 1000;
    });

    const alertBox = document.getElementById('alertBox');
    if (upcoming) {
        document.getElementById('alertMessage').textContent = 
            `${upcoming.name} starts at ${upcoming.start} in ${upcoming.room}`;
        alertBox.classList.add('show');
    } else {
        alertBox.classList.remove('show');
    }
}
}

function showNotification(message) {
const notif = document.getElementById('notification');
notif.textContent = message;
notif.classList.add('show');
setTimeout(() => notif.classList.remove('show'), 3000);
}

// ========================================
// START APPLICATION
// ========================================
init();
