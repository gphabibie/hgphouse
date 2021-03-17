const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const fabric = require("./fabric/controller.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("My first REST API! Developer"));
app.post("/enroll-admin", fabric.enrollAdmin);
app.post("/register-user", fabric.registerEnrollUser);
app.post("/create", fabric.createCar);
app.put("/update", fabric.updateCar);
app.get("/get", fabric.getHistoryForKey);
app.get("/history", fabric.getHistoryForKey);

const port = 8000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
