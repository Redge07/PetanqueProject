require("dotenv").config();

const express = require("express");
const app = express();

const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/log", require("./routes/log"));
app.use("/players", require("./routes/players"));
app.use("/organisateurs", require("./routes/organisateurs"));
app.use("/tournaments", require("./routes/tournaments"));
app.use("/gotournaments", require("./routes/gotournaments"));

// app.listen(port, () => {
//   console.log("Go server in Render");
// });

app.get("/", (req, res) => {
  res.send("Bienvenue dans le backend");
});

let x = 0;

app.get("/test", (req, res) => {
  x = x + 1;
  res.send(x);
});

app.listen(port, "0.0.0.0", () => {
  console.log("Server running on port " + port);
});
