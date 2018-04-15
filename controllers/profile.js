const handleProfileGet = (req, res, db) => {
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
};

module.exports = {
    handleProfileGet
};
