const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/createSyllabus", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { subject, term, instructions, images } = req.body;
    const studentClass = req.body.class;
    await pool.query("BEGIN");
    try {
      const token = authorization.split(" ")[1];
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const newSyllabus = await pool.query(
            "INSERT INTO syllabus (class, subject, term, instructions) VALUES ($1, $2, $3, $4) RETURNING syllabus_id",
            [studentClass, subject, term, instructions]
          );
          const syllabusId = newSyllabus.rows[0].syllabus_id;
          for(let image of images) {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            await pool.query(
              "INSERT INTO syllabusimages (syllabus_id, image_id) VALUES ($1, $2)",
              [syllabusId, newImage.rows[0].image_id]
            );
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Syllabus created successfully!!",
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

router.get("/getSyllabus", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { studentClass, subject, term } = req.query;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher" || role === "student") {
        try {
          let list = {}, filterString = "";
          if(studentClass) {
            filterString += `class = '${studentClass}'`;
          }
          if(subject) {
            if(filterString.length) {
              filterString += " AND ";
            }
            filterString += `subject = '${subject}'`;
          }
          if(term) {
            if(filterString.length) {
              filterString += " AND ";
            }
            filterString += `term = '${term}'`;
          }
          let syllabusList = [], syllabusData = [];
          if(filterString) {
            syllabusList = await pool.query(`SELECT * FROM syllabus WHERE ${filterString}`);
          } else {
            syllabusList = await pool.query(`SELECT * FROM syllabus`);
          }
          syllabusData = [...syllabusList.rows];
          syllabusList = [];
          for(let syllabus of syllabusData) {
            const syllabusImageList = await pool.query(
              `SELECT i.image_id, i.image_name, i.image_url FROM syllabusimages s, images i WHERE s.image_id = i.image_id AND s.syllabus_id = '${syllabus.syllabus_id}'`
            );
            const syllabusImageData = [...syllabusImageList.rows].map((row) => {
              return {
                id: row.image_id,
                name: row.image_name,
                src: row.image_url,
              };
            });
            syllabusList.push({
              id: syllabus.syllabus_id,
              class: syllabus.class,
              subject: syllabus.subject,
              term: syllabus.term,
              instructions: syllabus.instructions,
              images: [...syllabusImageData]
            });
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: `${
              syllabusList.length
                ? "Syllabus fetched successfully!!"
                : "No syllabus created yet!!"
            }`,
            syllabusList,
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

router.delete("/deleteSyllabus", async (req, res) => {
  try {
    const { syllabusId } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const list = await pool.query(`SELECT image_id from syllabusimages WHERE syllabus_id = '${syllabusId}'`);
          if(list.rows.length) {
            const imageArr = list.rows;
            for(let image of imageArr) {
              await pool.query(`DELETE FROM images WHERE image_id = '${image.image_id}'`);
            }
          } else {
            await pool.query("ROLLBACK");
            res
              .status(500)
              .json({ status: "Error", message: "Server error!!", error: err });
          }
          await pool.query(`DELETE FROM syllabus WHERE syllabus_id = '${syllabusId}'`);
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Syllabus deleted successfully!!"
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
