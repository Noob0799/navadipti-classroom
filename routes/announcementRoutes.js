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
          for (let image of images) {
            const newImage = await pool.query(
              "INSERT INTO images (image_name, image_url) VALUES ($1, $2) RETURNING image_id",
              [image.name, image.url]
            );
            await pool.query(
              "INSERT INTO announcementimages (announcement_id, image_id) VALUES ($1, $2)",
              [announcementId, newImage.rows[0].image_id]
            );
          }
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
        } finally {
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
    const { studentClass } = req.query;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher" || role === "student") {
        try {
          let announcementList = [],
            announcementData = [];
          if (studentClass) {
            announcementList = await pool.query(
              `SELECT announcement_id, class, announcement_date::varchar, announcement_time, instructions FROM announcement WHERE class = '${studentClass}'`
            );
          } else {
            announcementList = await pool.query("SELECT announcement_id, class, announcement_date::varchar, announcement_time, instructions FROM announcement");
          }
          announcementData = [...announcementList.rows];
          announcementList = [];
          for (let announcement of announcementData) {
            const announcementImageList = await pool.query(
              `SELECT i.image_id, i.image_name, i.image_url FROM announcementimages a, images i WHERE a.image_id = i.image_id AND a.announcement_id = '${announcement.announcement_id}'`
            );
            const announcementImageData = [...announcementImageList.rows].map(
              (row) => {
                return {
                  id: row.image_id,
                  name: row.image_name,
                  src: row.image_url,
                };
              }
            );
            announcementList.push({
              id: announcement.announcement_id,
              class: announcement.class,
              date: announcement.announcement_date,
              time: announcement.announcement_time,
              instructions: announcement.instructions,
              images: [...announcementImageData],
            });
          }
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: `${
              announcementList.length
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

router.delete("/deleteAnnouncement", async (req, res) => {
  try {
    const { announcementId } = req.query;
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    await pool.query("BEGIN");
    try {
      const { role } = jwt.verify(token, process.env.SECRET_KEY);
      if (role === "principal" || role === "teacher") {
        try {
          const list = await pool.query(
            `SELECT image_id from announcementimages WHERE announcement_id = '${announcementId}'`
          );
          if (list.rows.length) {
            const imageArr = list.rows;
            for (let image of imageArr) {
              await pool.query(
                `DELETE FROM images WHERE image_id = '${image.image_id}'`
              );
            }
          }
          await pool.query(
            `DELETE FROM announcement WHERE announcement_id = '${announcementId}'`
          );
          await pool.query("COMMIT");
          res.status(201).json({
            status: "Success",
            message: "Announcement deleted successfully!!",
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
