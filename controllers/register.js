const handleRegister = (req, res, db, bcrypt) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx
            .insert({
                hash: hash,
                email: email.toLowerCase()
            })
            .into("login")
            .returning("email")
            .then(loginEmail => {
                return trx("users")
                    .returning("*")
                    .insert({
                        name: name,
                        email: email.toLowerCase(),
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
};

module.exports = {
    handleRegister
};
