let nav = 0;
let tasks = JSON.parse(localStorage.getItem('smartCalendarTasks')) || [];

const calendarGrid = document.getElementById('calendarGrid');
const monthYearText = document.getElementById('monthYear');
const taskModal = document.getElementById('taskModal');

function initCalendar() {
    const dt = new Date();
    if (nav !== 0) dt.setMonth(new Date().getMonth() + nav);

    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearText.innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
    calendarGrid.innerHTML = '';

    for (let i = 0; i < firstDay + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        if (i >= firstDay) {
            const dayNum = i - firstDay + 1;
            const dayStr = `${year}-${month + 1}-${dayNum}`;
            daySquare.innerHTML = `<span style="font-weight:700">${dayNum}</span>`;

            const dayTasks = tasks.filter(t => t.date === dayStr);
            const filterValue = document.getElementById('taskFilter').value;

            dayTasks.forEach(task => {
                if (filterValue !== 'all' && task.status !== filterValue) return;
                const badge = document.createElement('div');
                badge.className = `task-badge ${task.priority} ${task.status === 'completed' ? 'completed' : ''}`;
                badge.innerText = task.title;
                badge.onclick = (e) => { e.stopPropagation(); openModal(dayStr, tasks.indexOf(task)); };
                daySquare.appendChild(badge);
            });
            daySquare.onclick = () => openModal(dayStr);
        } else {
            daySquare.style.visibility = 'hidden';
        }
        calendarGrid.appendChild(daySquare);
    }
}

function openModal(date, index = -1) {
    document.getElementById('taskDate').value = date;
    document.getElementById('editIndex').value = index;
    const footer = document.getElementById('modalFooter');
    footer.innerHTML = '<button type="submit" class="btn-primary">Save Task</button>';

    if (index > -1) {
        const t = tasks[index];
        document.getElementById('title').value = t.title;
        document.getElementById('description').value = t.description;
        document.getElementById('priority').value = t.priority;
        document.getElementById('dueTime').value = t.dueTime;
        document.getElementById('modalTitle').innerText = "Edit Task";

        const row = document.createElement('div');
        row.className = 'action-row';
        
        const cBtn = document.createElement('button');
        cBtn.className = 'btn-comp';
        cBtn.type = 'button';
        cBtn.innerText = t.status === 'completed' ? 'Set Pending' : 'Mark Done';
        cBtn.onclick = () => { tasks[index].status = (t.status === 'completed' ? 'pending' : 'completed'); save(); };

        const dBtn = document.createElement('button');
        dBtn.className = 'btn-del';
        dBtn.type = 'button';
        dBtn.innerText = 'Delete';
        dBtn.onclick = () => { if(confirm('Delete this task?')) { tasks.splice(index, 1); save(); } };

        row.appendChild(cBtn);
        row.appendChild(dBtn);
        footer.appendChild(row);
    } else {
        document.getElementById('taskForm').reset();
        document.getElementById('modalTitle').innerText = "New Task";
    }
    taskModal.style.display = 'block';
}

function save() {
    localStorage.setItem('smartCalendarTasks', JSON.stringify(tasks));
    taskModal.style.display = 'none';
    initCalendar();
}

document.getElementById('taskForm').onsubmit = (e) => {
    e.preventDefault();
    const idx = document.getElementById('editIndex').value;
    const data = {
        date: document.getElementById('taskDate').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        dueTime: document.getElementById('dueTime').value,
        status: idx > -1 ? tasks[idx].status : 'pending'
    };
    if (idx > -1) tasks[idx] = data; else tasks.push(data);
    save();
};

document.getElementById('nextMonth').onclick = () => { nav++; initCalendar(); };
document.getElementById('prevMonth').onclick = () => { nav--; initCalendar(); };
document.getElementById('taskFilter').onchange = initCalendar;
document.querySelector('.close-modal').onclick = () => taskModal.style.display = 'none';

window.onclick = (event) => { if (event.target == taskModal) taskModal.style.display = 'none'; };

initCalendar();