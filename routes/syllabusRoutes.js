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
          images.forEach(async (image) => {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            await pool.query(
              "INSERT INTO syllabusimages (syllabus_id, image_id) VALUES ($1, $2)",
              [syllabusId, newImage.rows[0].image_id]
            );
          });
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
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const list = await pool.query(
            "select s.syllabus_id, class, subject, term, i.image_id, i.image_name, i.image_url, s.instructions from syllabus s LEFT OUTER JOIN syllabusimages si ON s.syllabus_id = si.syllabus_id LEFT OUTER JOIN images i ON si.image_id = i.image_id"
          );
          let syllabusData = [...list.rows],
            syllabusList = [];
          const syllabusMap = new Map();
          syllabusData.forEach((syllabusObj) => {
            let imageArr = syllabusMap.get(syllabusObj.syllabus_id);
            if (!imageArr) {
              imageArr = [];
            }
            if (syllabusObj.image_id) {
              imageArr.push({
                id: syllabusObj.image_id,
                name: syllabusObj.image_name,
                url: syllabusObj.image_url,
              });
            }
            syllabusMap.set(syllabusObj.syllabus_id, imageArr);
          });
          syllabusData.forEach((syllabusObj) => {
            const imageArr = syllabusMap.get(syllabusObj.syllabus_id);
            if (imageArr) {
              syllabusList.push({
                id: syllabusObj.syllabus_id,
                class: syllabusObj.class,
                subject: syllabusObj.subject,
                term: syllabusObj.term,
                instructions: syllabusObj.instructions,
                images: imageArr,
              });
              syllabusMap.delete(syllabusObj.syllabus_id);
            }
          });
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: `${
              syllabusData.length
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

module.exports = router;
