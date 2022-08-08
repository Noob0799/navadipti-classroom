const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/createTask", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { taskType, subject, term, dueDate, instructions, images } = req.body;
    const studentClass = req.body.class;
    await pool.query("BEGIN");
    try {
      const token = authorization.split(" ")[1];
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const newTask = await pool.query(
            "INSERT INTO task (class, task_type, subject, term, due_date, instructions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING task_id",
            [studentClass, taskType, subject, term, dueDate, instructions]
          );
          const taskId = newTask.rows[0].task_id;
          for (let image of images) {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            await pool.query(
              "INSERT INTO taskimages (task_id, image_id) VALUES ($1, $2)",
              [taskId, newImage.rows[0].image_id]
            );
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Task created successfully!!",
          });
        } catch (err) {
          await pool.query("ROLLBACK");
          res
            .status(500)
            .json({ status: "Error", message: "Server error!!", error: err });
        }
      } else {
        await pool.query("ROLLBACK");
        res
          .status(403)
          .json({ status: "Failure", message: "User not authorized!!" });
      }
    } catch (err) {
      await pool.query("ROLLBACK");
      if (err.name === "TokenExpiredError") {
        res.status(403).json({
          status: "Failure",
          type: err.name,
          message: "Authorization token expired!!",
          error: err,
        });
      } else {
        res.status(403).json({
          status: "Failure",
          message: "Authorization failed!!",
          error: err,
        });
      }
    }
  } catch (err) {
    await pool.query("ROLLBACK");
    res
      .status(500)
      .json({ status: "Error", message: "Server error!!", error: err });
  }
});

router.get("/getTasks", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { studentClass, taskType, subject, term } = req.query;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role, id } = jwt.verify(token, process.env.SECRET_KEY);
      if (
        role === "principal" ||
        role === "teacher" ||
        (role === "student" && id)
      ) {
        try {
          let list = {},
            filterString = "";
          if (studentClass) {
            filterString += `class = '${studentClass}'`;
          }
          if (taskType) {
            if (filterString.length) {
              filterString += " AND ";
            }
            filterString += `task_type = '${taskType}'`;
          }
          if (subject) {
            if (filterString.length) {
              filterString += " AND ";
            }
            filterString += `subject = '${subject}'`;
          }
          if (term) {
            if (filterString.length) {
              filterString += " AND ";
            }
            filterString += `term = '${term}'`;
          }
          let taskList = [],
            taskData = [],
            submittedImageList = [];
          if (filterString) {
            taskList = await pool.query(
              `SELECT task_id, class, task_type, subject, term, due_date::varchar, instructions FROM task WHERE ${filterString}`
            );
          } else {
            taskList = await pool.query(
              `SELECT task_id, class, task_type, subject, term, due_date::varchar, instructions FROM task`
            );
          }
          taskData = [...taskList.rows];
          taskList = [];
          for (let task of taskData) {
            const taskImageList = await pool.query(
              `SELECT i.image_id, i.image_name, i.image_url FROM taskimages t, images i WHERE t.image_id = i.image_id AND t.task_id = '${task.task_id}'`
            );
            const taskImageData = [...taskImageList.rows].map((row) => {
              return {
                id: row.image_id,
                name: row.image_name,
                src: row.image_url,
              };
            });
            if (role === "student" && id) {
              submittedImageList = await pool.query(
                `SELECT s.student_id, s.student_name, s.student_class, s.student_roll, i.image_id, i.image_name, i.image_url FROM completedtaskimages t, images i, student s WHERE t.image_id = i.image_id AND t.student_id = s.student_id AND t.task_id = '${task.task_id}' AND t.student_id = '${id}'`
              );
            } else if (role === "principal" || role === "teacher") {
              submittedImageList = await pool.query(
                `SELECT s.student_id, s.student_name, s.student_class, s.student_roll, i.image_id, i.image_name, i.image_url FROM completedtaskimages t, images i, student s WHERE t.image_id = i.image_id AND t.student_id = s.student_id AND t.task_id = '${task.task_id}'`
              );
            }
            const submittedImageMap = new Map(),
              studentDetailsMap = new Map(),
              submittedImageData = [];
            [...submittedImageList.rows].forEach(
              (row) => {
                let tempImageList = [], tempDetailsList = [];
                if(submittedImageMap.has(row.student_id)) {
                  tempImageList = submittedImageMap.get(row.student_id);
                }
                tempImageList.push({
                  id: row.image_id,
                  name: row.image_name,
                  src: row.image_url
                });
                submittedImageMap.set(row.student_id, tempImageList);
                if(studentDetailsMap.has(row.student_id)) {
                  tempDetailsList = studentDetailsMap.get(row.student_id);
                }
                tempDetailsList.push({
                  studentName: row.student_name,
                  studentClass: row.student_class,
                  studentRoll: row.student_roll
                });
                studentDetailsMap.set(row.student_id, tempDetailsList);
              }
            );
            studentDetailsMap.forEach((studentDetailsArray, studentId) => {
              let imageObj = submittedImageMap.get(studentId);
              submittedImageData.push({
                studentId,
                ...studentDetailsArray[0],
                images: [...imageObj]
              });
            });
            taskList.push({
              id: task.task_id,
              class: task.class,
              taskType: task.task_type,
              subject: task.subject,
              term: task.term,
              dueDate: task.due_date,
              instructions: task.instructions,
              images: [...taskImageData],
              submittedImages: [...submittedImageData],
            });
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: `${
              taskList.length
                ? "Tasks fetched successfully!!"
                : "No task created yet!!"
            }`,
            taskList,
          });
        } catch (err) {
          await pool.query("ROLLBACK");
          res
            .status(500)
            .json({ status: "Error", message: "Server error!!", error: err });
        }
      } else {
        await pool.query("ROLLBACK");
        res
          .status(403)
          .json({ status: "Failure", message: "User not authorized!!" });
      }
    } catch (err) {
      await pool.query("ROLLBACK");
      if (err.name === "TokenExpiredError") {
        res.status(403).json({
          status: "Failure",
          type: err.name,
          message: "Authorization token expired!!",
          error: err,
        });
      } else {
        res.status(403).json({
          status: "Failure",
          message: "Authorization failed!!",
          error: err,
        });
      }
    }
  } catch (err) {
    await pool.query("ROLLBACK");
    res
      .status(500)
      .json({ status: "Error", message: "Server error!!", error: err });
  }
});

router.delete("/deleteTask", async (req, res) => {
  try {
    const { taskId } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          let imageArr = [];
          const taskList = await pool.query(
            `SELECT image_id from taskimages WHERE task_id = '${taskId}'`
          );
          const completedTaskList = await pool.query(
            `SELECT image_id from completedtaskimages WHERE task_id = '${taskId}'`
          );
          imageArr = [...taskList.rows, ...completedTaskList.rows];
          if (imageArr.length) {
            for (let image of imageArr) {
              await pool.query(
                `DELETE FROM images WHERE image_id = '${image.image_id}'`
              );
            }
          } else {
            await pool.query("ROLLBACK");
            res
              .status(500)
              .json({ status: "Error", message: "Server error!!", error: err });
          }
          await pool.query(`DELETE FROM task WHERE task_id = '${taskId}'`);
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Task deleted successfully!!",
          });
        } catch (err) {
          await pool.query("ROLLBACK");
          res
            .status(500)
            .json({ status: "Error", message: "Server error!!", error: err });
        }
      } else {
        await pool.query("ROLLBACK");
        res
          .status(403)
          .json({ status: "Failure", message: "User not authorized!!" });
      }
    } catch (err) {
      await pool.query("ROLLBACK");
      if (err.name === "TokenExpiredError") {
        res.status(403).json({
          status: "Failure",
          type: err.name,
          message: "Authorization token expired!!",
          error: err,
        });
      } else {
        res.status(403).json({
          status: "Failure",
          message: "Authorization failed!!",
          error: err,
        });
      }
    }
  } catch (err) {
    await pool.query("ROLLBACK");
    res
      .status(500)
      .json({ status: "Error", message: "Server error!!", error: err });
  }
});

router.post("/submitTask", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { taskId, images } = req.body;
    await pool.query("BEGIN");
    try {
      const token = authorization.split(" ")[1];
      const { role, id } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "student" && id) {
        try {
          for (let image of images) {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            const completedTask = await pool.query(
              "INSERT INTO completedtaskimages (task_id, image_id, student_id) VALUES ($1, $2, $3) RETURNING task_image_id",
              [taskId, newImage.rows[0].image_id, id]
            );
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Task submitted successfully!!",
          });
        } catch (err) {
          await pool.query("ROLLBACK");
          res
            .status(500)
            .json({ status: "Error", message: "Server error!!", error: err });
        }
      } else {
        await pool.query("ROLLBACK");
        res
          .status(403)
          .json({ status: "Failure", message: "User not authorized!!" });
      }
    } catch (err) {
      await pool.query("ROLLBACK");
      if (err.name === "TokenExpiredError") {
        res.status(403).json({
          status: "Failure",
          type: err.name,
          message: "Authorization token expired!!",
          error: err,
        });
      } else {
        res.status(403).json({
          status: "Failure",
          message: "Authorization failed!!",
          error: err,
        });
      }
    }
  } catch (err) {
    await pool.query("ROLLBACK");
    res
      .status(500)
      .json({ status: "Error", message: "Server error!!", error: err });
  }
});

module.exports = router;
