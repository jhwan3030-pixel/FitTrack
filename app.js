const express = require("express");
const path = require("path");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 메인 화면
app.get("/", async (req, res) => {
    try {
        const [exercises] = await pool.query(
            "SELECT * FROM exercises ORDER BY exercise_date DESC"
        );

        const [goals] = await pool.query(
            "SELECT * FROM goals ORDER BY created_at DESC LIMIT 1"
        );
const [weeklyExercises] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM exercises
     WHERE YEARWEEK(exercise_date, 1) = YEARWEEK(CURDATE(), 1)`
);

const weeklyCount = weeklyExercises[0].total;

const [monthlyExercises] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM exercises
     WHERE YEAR(exercise_date) = YEAR(CURDATE())
     AND MONTH(exercise_date) = MONTH(CURDATE())`
);

const monthlyCount = monthlyExercises[0].total;

const [typeStats] = await pool.query(
    `SELECT exercise_name, COUNT(*) AS total
     FROM exercises
     GROUP BY exercise_name
     ORDER BY total DESC`
);
const [achievements] = await pool.query(
    `SELECT achievement_date, achievement_type
     FROM achievements
     ORDER BY achievement_date DESC`
);
const goal = goals.length > 0 ? goals[0] : null;
const goalAchieved = goal && weeklyCount >= goal.weekly_target;
if (goalAchieved) {
    await pool.query(
        `INSERT IGNORE INTO achievements
        (goal_id, achievement_date, achievement_type)
        VALUES (?, CURDATE(), ?)`,
        [goal.id, "weekly_goal"]
    );
}
res.render("index", {
    exercises,
    goal,
    weeklyCount,
    monthlyCount,
    typeStats,
    achievements,
    goalAchieved
});

    } catch (error) {
        console.error(error);
        res.status(500).send("데이터베이스 오류가 발생했습니다.");
    }
});
// 주간 운동 목표 저장
app.post("/goals/add", async (req, res) => {
    try {
        const { weekly_target } = req.body;

        await pool.query(
            "INSERT INTO goals (weekly_target) VALUES (?)",
            [weekly_target]
        );

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("운동 목표 저장에 실패했습니다.");
    }
});
// 운동 기록 저장
app.post("/exercises/add", async (req, res) => {
    try {
        const { exercise_name, duration, exercise_date, memo } = req.body;

        await pool.query(
            `INSERT INTO exercises
            (exercise_name, duration, exercise_date, memo)
            VALUES (?, ?, ?, ?)`,
            [exercise_name, duration, exercise_date, memo]
        );

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("운동 기록 저장에 실패했습니다.");
    }
});
// 운동 기록 삭제
app.post("/exercises/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM exercises WHERE id = ?",
            [id]
        );

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("운동 기록 삭제에 실패했습니다.");
    }
});
// 운동 기록 수정
app.post("/exercises/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { exercise_name, duration, exercise_date, memo } = req.body;

        await pool.query(
            `UPDATE exercises
             SET exercise_name = ?, duration = ?, exercise_date = ?, memo = ?
             WHERE id = ?`,
            [exercise_name, duration, exercise_date, memo, id]
        );

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("운동 기록 수정에 실패했습니다.");
    }
});
const PORT = process.env.PORT || 3000

app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitTrack server running on port ${PORT}`);
});
