const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const knex = require("knex");
const bcrypt = require("bcrypt-nodejs");

const db = knex({
    client: "pg",
    connection: {
        host: "127.0.0.1",
        user: "postgres",
        password: "postgres",
        database: "smart-brain"
    }
});

// db
//     .select()
//     .table("users")
//     .then(data => console.log("app top, test data:", data));

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send(database.users);
});

app.get("/profile/:id", (req, res) => {
    const { id } = req.params;

    db("users")
        .where("id", id)
        .then(profile => {
            if (profile.length > 0) {
                res.json(profile[0]);
            } else {
                res.status(400).json("Not found");
            }
        })
        .catch(err => {
            res.status(400).json("Error getting profile");
        });
});

app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    console.log("req.body:", req.body);

    db("login")
        .where("email", email)
        .select("email", "hash")
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);

            if (isValid) {
                return db
                    .select("*")
                    .from("users")
                    .where("email", email)
                    .then(user => {
                        res.json(user[0]);
                    })
                    .catch(err => res.status(400).json("Unable to get user"));
            } else {
                res.status(400).json("Wrong credentials");
            }
        })
        .catch(err => res.status(400).json("Unable to login"));
});

app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx
            .insert({
                hash: hash,
                email: email
            })
            .into("login")
            .returning("email")
            .then(loginEmail => {
                return trx("users")
                    .returning("*")
                    .insert({
                        name: name,
                        email: email,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
                    .catch(err => {
                        res.status(400).json("unable to register");
                    });
            })
            .then(trx.commit)
            .catch(trx.rollback);
    });
});

app.put("/image", (req, res) => {
    const { id } = req.body;

    db("users")
        .returning("entries")
        .where("id", id)
        .increment("entries", 1)
        .then(response => {
            if (response.length > 0) {
                res.send(response[0]);
            } else {
                res.status(400).json("Unable to get entries...");
            }
        })
        .catch(err => res.status(400).json(err));
});

app.listen(3000, () => {
    console.log("app is running, everything is fine...");
});
