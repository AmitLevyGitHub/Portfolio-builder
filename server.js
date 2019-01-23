const express = require("express");

const linkedinCtl = require("./controllers/linkedin.ctl");
const unsplashCtl = require("./controllers/unsplash.ctl");
const profileCtl = require("./controllers/profile.ctl");
const app = express();
const port = process.env.PORT || 3000;
app.set("port", port);

const Parser = require("body-parser");
app.use(Parser.urlencoded({ extended: true }));

app.use("/", express.static("./public")); // for API

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type, Accept"
  );
  res.set("Content-Type", "application/json");
  next();
});

/*** All routes ***/
app.get("/", linkedinCtl.linkedinConnect);
app.get("/authorize", linkedinCtl.getAccessToken, linkedinCtl.setAccessToken);
app.post("/questions", unsplashCtl.getphotos);
app.get("/showProfile", profileCtl.showProfile);
app.put("/update", profileCtl.updateSummary);

app.listen(port, () => console.log(`listening on port ${port}`));
