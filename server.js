require('newrelic');
const { Router } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const shortUrl = require("./models/shortUrl");
const ShortUrl = require("./models/shortUrl");
const app = express();


// serve static files
app.use(express.static("public"));

// connect mongoose with database
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@cluster0.kraip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true, useUnifiedTopology: true
});

const db = mongoose.connection;

// error connection
db.on("error", () => {
  console.log("mongodb error!");
});

// successful connection
db.once("open", () => {
  console.log("mongodb connected!");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//rendering  html
app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});
 
//passing full url input to the models
app.post("/shortUrls", async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });

  res.redirect("/");
});

//redirecting to the full url
app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});


//DELETE
app.route("/remove/:id").get((req, res) => {
  const id = req.params.id;
  shortUrl.findByIdAndDelete(id, err => {
  if (err) return res.send(500, err);
  res.redirect("/");
  });
  });
  
  
  //serve the pages on port 5000
app.listen(process.env.PORT || 5000);
