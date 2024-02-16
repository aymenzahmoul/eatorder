const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const adminRouter = require("./routers/adminRouter");
const ownerRouter = require("./routers/ownerRouter");
const managerRouter = require("./routers/managerRouter");
const sseRouter = require("./routers/sseRouter");

const cors = require("cors");
const app = express();
const server = http.createServer(app);
const multer = require("multer");
const path = require("path");
const clientRouter = require("./routers/clientRouter");
const session = require("express-session");
const passport = require("passport");
const passportSetup = require('./middlewares/passportSetup')
const cookieSession = require("cookie-session")
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const stripe = require('stripe')('sk_test_51OdqTeD443RzoOO5zes08H5eFoRH1W4Uyv2sZU8YMmpGM7fU9FKqpIDF87xml7omZVugkMmjfW3YhBG7R5ylxQTJ00lH5Qdpji');
const mongoUri = 'mongodb://makseb:makseb@mongo:27017';
app.use(express.static(path.join(__dirname, "views")));

app.use(express.static("uploads"));

app.use(express.urlencoded({ extended: true, encoding: "utf-8" }));

app.use(cookieParser());
//added middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json())
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//cors
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());

// Utilisation des routes
app.use("/admin", adminRouter);
app.use("/owner", ownerRouter);
app.use("/client", clientRouter);
app.use("/manager", managerRouter);
app.use("/sse", sseRouter);

let isConnected = false;
require("dotenv").config();
async function connectWithRetry() {
  try {
    await mongoose.connect("mongodb+srv://makseb77:makseb77@maksebdb.pljkidi.mongodb.net/?retryWrites=true&w=majority");
    isConnected = true;
    console.log("Connected to MongoDB DATABASE");
  } catch (error) {
    console.error("Failed to connect to MongoDB");
    isConnected = false;
    // Réessayez la connexion après 5 secondes
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

// Démarrez le serveur
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
