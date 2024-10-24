"use strict";

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const loki = require("lokijs");
const fs = require("fs");
const del = require("del");
const path = require("path");
const app = express();
app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));
app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Storage setup
const DB_NAME = "db.json";
const UPLOAD_PATH = "uploads";
const upload = multer({ dest: `${UPLOAD_PATH}/` });
const db = new loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: "fs" });

// Utils
// load existing file collection or create a new one
const loadCollection = function(colName, _db) {
  return new Promise(resolve => {
    _db.loadDatabase({}, () => {
      const _collection =
        _db.getCollection(colName) || _db.addCollection(colName);
      resolve(_collection);
    });
  });
};
// Delete existing files helper ( to avoid to many files being uploaded)
const cleanUploads = async function(folderPath) {
  try {
    await del.sync([`${folderPath}/**`, `!${folderPath}`]);
    console.info("INFO: Cleaned all previosly uploaded files!");
  } catch (e) {
    console.log(e);
  }
};

// API handlers
// File upload handler
const fileUploadHandler = async (req, res, next) => {
  try {
    const file = req.file;
    const collection = await loadCollection("files", db);
    const data = collection.insert(file);
    db.saveDatabase();
    res.status(200).json({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: "/api/files/" + file.$loki
    });
  } catch (e) {
    next(e);
  }
};
// File get handler
const getFileHandler = async (req, res, next) => {
  try {
    const collection = await loadCollection("files", db);
    if (!req.params.id) {
      return res.send(collection.data);
    }
    const result = collection.get(req.params.id);
    if (!result) return res.sendStatus(404);
    res.setHeader("Content-Type", result.mimetype);
    fs.createReadStream(path.join("uploads", result.filename)).pipe(res);
  } catch (e) {
    next(e);
  }
};

// API endpoints
// Upload file
app.post("/api/fileanalyse", upload.single("upfile"), fileUploadHandler);
// Get file(s)
app.get("/api/files/:id?", getFileHandler);

app.listen(process.env.PORT || 3000, function() {
  console.log("SERVER: Node.js listening on PORT:", process.env.PORT || 3000);
  cleanUploads(UPLOAD_PATH);
});
