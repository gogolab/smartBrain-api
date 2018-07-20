const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return Promise.reject("Incorrect form submission");
    }

    return db("login")
        .where("email", email.toLowerCase())
        .select("email", "hash")
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);

            if (isValid) {
                return db
                    .select("*")
                    .from("users")
                    .where("email", email.toLowerCase())
                    .then(user => user[0])
                    .catch(err => Promise.reject("Unable to get user"));
            } else {
                Promise.reject("Wrong credentials");
            }
        })
        .catch(err => Promise.reject("Unable to login"));
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;

    return authorization
        ? getAuthTokenId()
        : handleSignin(req, res, db, bcrypt)
              .then(data => res.json(data))
              .catch(err => res.status(400).json(err));
};

module.exports = {
    signinAuthentication: signinAuthentication
};
