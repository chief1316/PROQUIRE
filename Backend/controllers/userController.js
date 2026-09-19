const db = require("../config/db");

exports.getCurrentUser = (req, res) => {

    const userId = req.user.user_id;

    db.query(
        "SELECT user_id, full_name, email, phone, role, profile_photo, created_at FROM users WHERE user_id = ?",
        [userId],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = results[0];

            user.profile_photo = user.profile_photo
                ? `http://localhost:5000/uploads/profile_photos/${user.profile_photo}`
                : null;

            res.json(user);

        }
    );

};

exports.updateCurrentUser = (req, res) => {

    const userId = req.user.user_id;

    const { full_name, phone } = req.body;

    let sql =
        "UPDATE users SET full_name = ?, phone = ?";

    let values = [full_name, phone];

    if (req.file) {

        sql += ", profile_photo = ?";

        values.push(req.file.filename);

    }

    sql += " WHERE user_id = ?";

    values.push(userId);

    db.query(sql, values, (err) => {

        if (err) {

            return res.status(500).json(err);

        }

        res.json({

            message: "Profile updated successfully"

        });

    });

};