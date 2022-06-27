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
          images.forEach(async (image) => {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            await pool.query(
              "INSERT INTO taskimages (task_id, image_id) VALUES ($1, $2)",
              [taskId, newImage.rows[0].image_id]
            );
          });
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
        res
          .status(403)
          .json({
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
    const { taskType, subject, term } = req.query;
    const studentClass = req.query.class;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher" || role === "student") {
        try {
          let list = {};
          if(studentClass && taskType && subject && term) {
            list = await pool.query(
              `select t.task_id, class, task_type, subject, term, due_date, i.image_id, i.image_name, i.image_url, t.instructions from task t LEFT OUTER JOIN taskimages ti ON t.task_id = ti.task_id LEFT OUTER JOIN images i ON ti.image_id = i.image_id WHERE class = '${studentClass}' AND task_type = '${taskType}' AND subject = '${subject}' AND term = '${term}'`
            );
          } else {
            list = await pool.query(
              "select t.task_id, class, task_type, subject, term, due_date, i.image_id, i.image_name, i.image_url, t.instructions from task t LEFT OUTER JOIN taskimages ti ON t.task_id = ti.task_id LEFT OUTER JOIN images i ON ti.image_id = i.image_id"
            );
          }
          let taskData = [...list.rows],
          taskList = [];
          const taskMap = new Map();
          taskData.forEach((taskObj) => {
            let imageArr = taskMap.get(taskObj.task_id);
            if (!imageArr) {
              imageArr = [];
            }
            if (taskObj.image_id) {
              imageArr.push({
                id: taskObj.image_id,
                name: taskObj.image_name,
                url: taskObj.image_url,
              });
            }
            taskMap.set(taskObj.task_id, imageArr);
          });
          taskData.forEach((taskObj) => {
            const imageArr = taskMap.get(taskObj.task_id);
            if (imageArr) {
              taskList.push({
                id: taskObj.task_id,
                class: taskObj.class,
                taskType: taskObj.task_type,
                subject: taskObj.subject,
                term: taskObj.term,
                dueDate: taskObj.due_date,
                instructions: taskObj.instructions,
                images: imageArr,
              });
              taskMap.delete(taskObj.task_id);
            }
          });
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: `${
              taskData.length
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
          const list = await pool.query(`SELECT image_id from taskimages WHERE task_id = '${taskId}'`);
          if(list.rows.length) {
            const imageArr = list.rows;
            imageArr.forEach(async image => {
              await pool.query(`DELETE FROM images WHERE image_id = '${image.image_id}'`);
            });
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
            message: "Task deleted successfully!!"
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
