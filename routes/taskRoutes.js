const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post('/createTask', async (req,res) => {
    try {
        const { authorization } = req.headers;
        const { taskType, subject, term, dueDate, instructions, images } = req.body;
        const studentClass = req.body.class;
        await pool.query('BEGIN');
        try {
          const token = authorization.split(" ")[1];
          const { role } = jwt.verify(token, process.env.SECRET_KEY);
          if (role === "principal" || role === "teacher") {
            const newTask = await pool.query(
              "INSERT INTO task (class, task_type, subject, term, due_date, instructions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING task_id",
              [studentClass, taskType, subject, term, dueDate, instructions]
            );
            const taskId = newTask.rows[0].task_id;
            images.forEach(async image => {
                const newImage = await pool.query(
                    "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
                    [image.name, image.url]
                  );
                  await pool.query(
                    "INSERT INTO taskimages (task_id, image_id) VALUES ($1, $2)",
                    [taskId, newImage.rows[0].image_id]
                  );
            });
            await pool.query('COMMIT');
            res.status(201).json({
              status: "Success",
              message: "Task created successfully!!",
            });
          } else {
            await pool.query('ROLLBACK');
            res
              .status(403)
              .json({ status: "Failure", message: "User not authorized!!" });
          }
        } catch (err) {
          await pool.query('ROLLBACK');
          if (err.name === "TokenExpiredError") {
            res.status(403).json({
              status: "Failure",
              type: err.name,
              message: "Authorization token expired!!",
              error: err
            });
          } else {
            res
              .status(403)
              .json({ status: "Failure", message: "Authorization failed!!", error: err });
          }
        }
      } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ status: "Error", message: "Server error!!", error: err });
      }
});

module.exports = router;