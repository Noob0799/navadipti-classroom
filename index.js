const express = require("express");
const app = express();
const port = process.env.PORT || "5000";
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const syllabusRoutes = require("./routes/syllabusRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

app.use(cors());
app.use(express.json());

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "frontend/build")));
}

app.use("/auth", authRoutes);
app.use("/task", taskRoutes);
app.use("/syllabus", syllabusRoutes);
app.use("/announcement", announcementRoutes);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/build/index.html"));
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

module.exports = app;