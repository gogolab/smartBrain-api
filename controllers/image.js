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
    handleImage
};
