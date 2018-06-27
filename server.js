const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const knex = require("knex");
const bcrypt = require("bcrypt-nodejs");
const morgan = require("morgan");

const image = require("./controllers/image");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");

const db = knex({
    client: "pg",
    // connection: {
    //     host: "127.0.0.1",
    //     user: "postgres",
    //     password: "postgres",
    //     database: "smart-brain"
    // }
    connection: process.env.POSTGRES_URI
});

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

app.get("/test", (req, res) => {
    res.send("damn, it is working...");
});

app.get("/profile/:id", (req, res) => {
    profile.handleProfileGet(req, res, db);
});

app.post("/signin", (req, res) => {
    signin.handleSignin(req, res, db, bcrypt);
});

app.post("/register", (req, res) =>
    register.handleRegister(req, res, db, bcrypt)
);

app.put("/image", (req, res) => image.handleImage(req, res, db));

app.post("/image_url", image.handleApiCall);

app.listen(3000, () => {
    console.log("app is running, everything is fine...");
});
