const calendar = document.getElementById("calendar");
const calendarTitle = document.getElementById("calendarTitle");

// index.ejs에서 전달받은 운동 기록
const exerciseRecords = window.exerciseRecords || [];

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    calendarTitle.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = "";

    const days = ["일", "월", "화", "수", "목", "금", "토"];

    days.forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    for (let date = 1; date <= lastDate; date++) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-date";

        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

        dayElement.textContent = date;

        const dayExercises = exerciseRecords.filter(
            exercise => exercise.date === dateKey
        );

        dayExercises.forEach(exercise => {
            const nameElement = document.createElement("div");
            nameElement.className = "calendar-exercise";
            nameElement.textContent = exercise.name;
            dayElement.appendChild(nameElement);
        });

        if (dayExercises.length > 0) {
            dayElement.classList.add("has-exercise");
        }

        calendar.appendChild(dayElement);
    }
}

document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();
