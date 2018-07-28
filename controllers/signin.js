const jwt = require("jsonwebtoken");
const redis = require("redis");

// setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

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

const signToken = email => {
    const jwtPayload = { email };
    return jwt.sign(jwtPayload, "JWT_SECRET");
};

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value));
};

const createSessions = user => {
    // jwt token, return user data
    const { id, email } = user;
    const token = signToken(email);

    return setToken(token, id)
        .then(() => ({ success: true, userId: id, token: token }))
        .catch(console.log);
};

const getAuthTokenId = (req, res) => {
    const { authorization } = req.headers;

    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(400).json("unauthorized");
        }

        return res.json({ id: reply });
    });
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;

    return authorization
        ? getAuthTokenId(req, res)
        : handleSignin(req, res, db, bcrypt)
              .then(data => {
                  return data.id && data.email
                      ? createSessions(data)
                      : Promise.reject(data);
              })
              .then(session => res.json(session))
              .catch(err => res.status(400).json(err));
};

module.exports = {
    signinAuthentication: signinAuthentication,
    redisClient: redisClient
};
