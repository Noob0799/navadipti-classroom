const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtgenerator = require("../utils/jwtgenerator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/validate", async (req, res) => {
  try {
    await pool.query("BEGIN");
    const { role, phoneNumber, password } = req.body;
    const user = await pool.query(
      `SELECT * FROM ${role} where ${role}_phone = $1`,
      [phoneNumber]
    );
    if (!user.rows.length) {
      await pool.query("ROLLBACK");
      res.status(401).json({
        status: "Failure",
        message: "User phone number or password incorrect!!",
      });
    } else {
      const match = await bcrypt.compare(
        password,
        user.rows[0][`${role}_password`]
      );
      if (match) {
        let payload = {};
        if (role === "teacher") {
          payload = {
            id: user.rows[0].teacher_id,
            role: user.rows[0].teacher_role,
          };
        } else {
          payload = { id: user.rows[0].student_id, role: "student" };
        }
        await pool.query("COMMIT");
        res.status(201).json({
          status: "Success",
          message: "Validated successfully!!",
          token: jwtgenerator(payload),
        });
      } else {
        await pool.query("ROLLBACK");
        res.status(401).json({
          status: "Failure",
          message: "User phone number or password incorrect!!",
        });
      }
    }
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ status: "Error", message: "Server error!!", error });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { identity, name, studentClass, phoneNumber, password } = req.body;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal") {
        const user = await pool.query(
          `SELECT * FROM ${identity} where ${identity}_phone = $1`,
          [phoneNumber]
        );
        if (user.rows.length) {
          await pool.query("ROLLBACK");
          res.status(401).json({
            status: "Failure",
            message: "User with provided phone number exists!!",
          });
        } else {
          const saltRounds = 10;
          const genSalt = await bcrypt.genSalt(saltRounds);
          const hash = await bcrypt.hash(password, genSalt);
          if (identity === "teacher") {
            await pool.query(
              "INSERT INTO teacher (teacher_role, teacher_name, teacher_phone, teacher_password) VALUES ($1, $2, $3, $4)",
              [identity, name, phoneNumber, hash]
            );
          } else {
            await pool.query(
              "INSERT INTO student (student_name, student_class, student_phone, student_password) VALUES ($1, $2, $3, $4)",
              [name, studentClass, phoneNumber, hash]
            );
          }
          await pool.query("COMMIT");
          res
            .status(201)
            .json({ status: "Success", message: "User added successfully!!" });
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
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ status: "Error", message: "Server error!!", error });
  }
});

router.get("/getUsers", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { identity, studentClass } = req.query;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal") {
        try {
          let teacherList = [],
            studentList = [],
            userList = [],
            userData = [];
          if (identity === "student") {
            if (studentClass) {
              studentList = await pool.query(
                `SELECT * FROM student WHERE student_class = '${studentClass}'`
              );
            } else {
              studentList = await pool.query("SELECT * FROM student");
            }
          } else if (identity === "teacher") {
            teacherList = await pool.query("SELECT * FROM teacher");
          } else {
            teacherList = await pool.query("SELECT * FROM teacher");
            studentList = await pool.query("SELECT * FROM student");
          }
          const studentData = [];
          for (let student of studentList.rows) {
            const imageIdList = await pool.query(
              `SELECT image_id FROM completedtaskimages WHERE student_id = '${student.student_id}'`
            );
            const imageArr = imageIdList.rows;
            const imageList = [];
            for (let image of imageArr) {
              const list = await pool.query(
                `SELECT * FROM images WHERE image_id = '${image.image_id}'`
              );
              const imageObj =
                list.rows && list.rows.length ? list.rows[0] : {};
              if (imageObj.image_id) {
                imageList.push({
                  id: imageObj.image_id,
                  name: imageObj.image_name,
                  src: imageObj.image_url,
                });
              }
            }
            studentData.push({
              student_id: student.student_id,
              student_name: student.student_name,
              student_class: student.student_class,
              student_phone: student.student_phone,
              student_images: imageList
            });
          }
          userData = userData.concat(
            teacherList.rows ? teacherList.rows : [],
            studentData
          );
          for (let user of userData) {
            if (user.teacher_id) {
              userList.push({
                id: user.teacher_id,
                identity: user.teacher_role,
                name: user.teacher_name,
                phone: user.teacher_phone,
              });
            } else {
              userList.push({
                id: user.student_id,
                identity: "student",
                name: user.student_name,
                class: user.student_class,
                phone: user.student_phone,
                uploadedImages: user.student_images
              });
            }
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Users fetched successfully!!",
            userList,
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

router.delete("/deleteUser", async (req, res) => {
  try {
    const { userId, identity } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal") {
        try {
          if (identity === "student") {
            const imageIdList = await pool.query(
              `SELECT image_id FROM completedtaskimages WHERE student_id = '${userId}'`
            );
            const imageArr = [...imageIdList.rows];
            for (let image of imageArr) {
              await pool.query(
                `DELETE FROM images WHERE image_id = '${image.image_id}'`
              );
            }
          }
          await pool.query(
            `DELETE FROM ${identity} WHERE ${identity}_id = '${userId}'`
          );
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "User deleted successfully!!",
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
