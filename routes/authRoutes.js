const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtgenerator = require("../utils/jwtgenerator");

router.post("/validate", async (req, res) => {
  try {
    const { role, phoneNumber, password } = req.body;
    const user = await pool.query(
      `SELECT * FROM ${role} where ${role}_phone = $1`,
      [phoneNumber]
    );
    if (!user.rows.length) {
      res
        .status(401)
        .json({ status: "Failure", message: "User phone number or password incorrect!!" });
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
        res.status(201).json({
          status: "Success",
          message: "Validated successfully!!",
          token: jwtgenerator(payload),
        });
      } else {
        res
          .status(401)
          .json({ status: "Failure", message: "User phone number or password incorrect!!" });
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Server error!!", error: err });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { role, name, studentClass, phoneNumber, password } = req.body;
    await pool.query('BEGIN');
    const user = await pool.query(
      `SELECT * FROM ${role} where ${role}_phone = $1`,
      [phoneNumber]
    );
    if (user.rows.length) {
      await pool.query('ROLLBACK');
      res.status(401).json({
        status: "Failure",
        message: "User with provided phone number exists!!",
      });
    } else {
      const saltRounds = 10;
      const genSalt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, genSalt);
      if (role === "teacher") {
        await pool.query(
          "INSERT INTO teacher (teacher_role, teacher_name, teacher_phone, teacher_password) VALUES ($1, $2, $3, $4)",
          [role, name, phoneNumber, hash]
        );
      } else {
        await pool.query(
          "INSERT INTO student (student_name, student_class, student_phone, student_password) VALUES ($1, $2, $3, $4)",
          [name, studentClass, phoneNumber, hash]
        );
      }
      await pool.query('COMMIT');
      res
        .status(201)
        .json({ status: "Success", message: "User added successfully!!" });
    }
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ status: "Error", message: "Server error!!", error: err });
  }
});

module.exports = router;
