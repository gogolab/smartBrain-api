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

const handleProfileUpdate = (req, res, db) => {
    // TODO: security checks
    console.log("req.body:", req.body);
    const { id } = req.params;
    const { name, age, pet } = req.body.formInput;

    db("users")
        .where({ id })
        .update({ name })
        .then(response => {
            if (response) {
                res.json("success, dude...");
            } else {
                res.status("400").json("Unable to update");
            }
        })
        .catch(err => res.status("400").json("error updating user"));
};

module.exports = {
    handleProfileGet,
    handleProfileUpdate
};
