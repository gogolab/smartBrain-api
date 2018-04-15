const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json("Incorrect form submission");
    }

    db("login")
        .where("email", email.toLowerCase())
        .select("email", "hash")
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);

            if (isValid) {
                return db
                    .select("*")
                    .from("users")
                    .where("email", email.toLowerCase())
                    .then(user => {
                        res.json(user[0]);
                    })
                    .catch(err => res.status(400).json("Unable to get user"));
            } else {
                res.status(400).json("Wrong credentials");
            }
        })
        .catch(err => res.status(400).json("Unable to login"));
};

module.exports = {
    handleSignin
};
