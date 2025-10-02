const express = require("express");
const app = express();
const port = 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/log", require("./routes/log"));
app.use("/players", require("./routes/players"));
app.use("/organisateurs", require("./routes/organisateurs"));
app.use("/tournaments", require("./routes/tournaments"));
app.use("/gotournaments", require("./routes/gotournaments"));

app.listen(port, () => {
  console.log("Go server");
});
