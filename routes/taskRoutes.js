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
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher" || role === "student") {
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
            taskData = [];
          if (filterString) {
            taskList = await pool.query(
              `SELECT task_id, class, task_type, subject, term, due_date::varchar, instructions FROM task WHERE ${filterString}`
            );
          } else {
            taskList = await pool.query(`SELECT task_id, class, task_type, subject, term, due_date::varchar, instructions FROM task`);
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
            const submittedImageList = await pool.query(
              `SELECT i.image_id, i.image_name, i.image_url FROM completedtaskimages t, images i WHERE t.image_id = i.image_id AND t.task_id = '${task.task_id}'`
            );
            const submittedImageData = [...submittedImageList.rows].map((row) => {
              return {
                id: row.image_id,
                name: row.image_name,
                src: row.image_url,
              };
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
              submittedImages: [...submittedImageData]
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
    const { id, images } = req.body;
    await pool.query("BEGIN");
    try {
      const token = authorization.split(" ")[1];
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "student") {
        try {
          const taskId = id;
          console.log(id, images);
          for (let image of images) {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            const completedTask = await pool.query(
              "INSERT INTO completedtaskimages (task_id, image_id) VALUES ($1, $2) RETURNING task_image_id",
              [taskId, newImage.rows[0].image_id]
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
