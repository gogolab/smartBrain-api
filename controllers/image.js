const Clarifai = require("clarifai");

const app = new Clarifai.App({
    apiKey: process.env.CLARIFAI_API_KEY
});

const handleApiCall = (req, res) => {
    app.models
        .predict("a403429f2ddf4b49b307e318f00e528b", req.body.input)
        .then(data => res.send(data))
        .catch(err => res.status(400).json("Unable to call API"));
};

const handleImage = (req, res, db) => {
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
};

module.exports = {
    handleImage,
    handleApiCall
};
