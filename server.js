"use strict";

var express = require("express");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var fs = require("fs");
var multer = require("multer");

var app = express();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    var getFileExt = function(fileName) {
      var fileExt = fileName.split(".");
      if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
        return "";
      }
      return fileExt.pop();
    };
    cb(null, Date.now() + "." + getFileExt(file.originalname));
  }
});

var multerUpload = multer({
  storage: storage
});

var uploadFile = multerUpload.single("userFile");

var fileSchema = new Schema({
  name: String,
  size: Number,
  date: String
});
var File = mongoose.model("File", fileSchema);
var mongouri = process.env.MONGOLAB_URI || "mongodb://localhost:27017/file-meta";
mongoose.connect(mongouri);

app.use(express.static(__dirname + "/views"));

app.get("/", function(req, res) {
  res.sendFile("index.html");
});  

app.post("/upload", function(req, res) {
  uploadFile(req, res, function(err) {
    if (err) throw err;
    var fileDetails = {
      size: req.file.size
    };
    console.log(fileDetails);
    // save file to db
    var file = new File(fileDetails);
    file.save(function(err, file) {
     if (err) throw err;
    });
    var filePath = "./uploads/" + req.file.filename; 
    fs.unlinkSync(filePath);
    res.send(fileDetails);
  });
});



var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Node.js listening on port "+ port);
});