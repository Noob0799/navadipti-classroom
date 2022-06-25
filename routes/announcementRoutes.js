const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/createAnnouncement", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { date, time, images, instructions } = req.body;
    const studentClass = req.body.class;
    await pool.query("BEGIN");
    try {
      const token = authorization.split(" ")[1];
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const newAnnouncement = await pool.query(
            "INSERT INTO announcement (class, announcement_date, announcement_time, instructions) VALUES ($1, $2, $3, $4) RETURNING announcement_id",
            [studentClass, date, time, instructions]
          );
          const announcementId = newAnnouncement.rows[0].announcement_id;
          images.forEach(async (image) => {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            await pool.query(
              "INSERT INTO announcementimages (announcement_id, image_id) VALUES ($1, $2)",
              [announcementId, newImage.rows[0].image_id]
            );
          });
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Announcement created successfully!!",
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

router.get("/getAnnouncements", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const list = await pool.query(
            "select a.announcement_id, class, announcement_date, announcement_time, i.image_id, i.image_name, i.image_url, a.instructions from announcement a LEFT OUTER JOIN announcementimages ai ON a.announcement_id = ai.announcement_id LEFT OUTER JOIN images i ON ai.image_id = i.image_id"
          );
          let announcementData = [...list.rows],
            announcementList = [];
          const announcementMap = new Map();
          announcementData.forEach((announcementObj) => {
            let imageArr = announcementMap.get(announcementObj.announcement_id);
            if (!imageArr) {
              imageArr = [];
            }
            if (announcementObj.image_id) {
              imageArr.push({
                id: announcementObj.image_id,
                name: announcementObj.image_name,
                url: announcementObj.image_url,
              });
            }
            announcementMap.set(announcementObj.announcement_id, imageArr);
          });
          announcementData.forEach((announcementObj) => {
            const imageArr = announcementMap.get(
              announcementObj.announcement_id
            );
            if (imageArr) {
              announcementList.push({
                id: announcementObj.announcement_id,
                class: announcementObj.class,
                date: announcementObj.announcement_date,
                time: announcementObj.announcement_time,
                instructions: announcementObj.instructions,
                images: imageArr,
              });
              announcementMap.delete(announcementObj.announcement_id);
            }
          });
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: `${
              announcementData.length
                ? "Announcements fetched successfully!!"
                : "No announcements made yet!!"
            }`,
            announcementList,
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
