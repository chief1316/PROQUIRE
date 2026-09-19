const db = require("../config/db");
const reviewModel = require("../models/reviewModel");

exports.createReview = (req, res) => {

    const client_id = req.user.user_id;

const {

    technician_id,

    rating,

    comment

} = req.body;

    const sql = `

        INSERT INTO reviews

        (

            client_id,

            technician_id,

            rating,

            comment

        )

        VALUES (?, ?, ?, ?)

    `;

    db.query(

        sql,

        [

            client_id,

            technician_id,

            rating,

            comment

        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    message: "Error creating review",

                    error: err

                });

            }

            res.status(201).json({

                message: "Review created successfully",

                reviewId: result.insertId

            });

        }

    );

};

exports.getTechnicianReviews = (req, res) => {

    const { technicianId } = req.params;

    const sql = `

        SELECT

            r.review_id,

            u.full_name AS client_name,

            r.rating,

            r.comment,

            r.review_date

        FROM reviews r

        JOIN users u

            ON r.client_id = u.user_id

        WHERE r.technician_id = ?

        ORDER BY r.review_date DESC

    `;

    db.query(

        sql,

        [technicianId],

        (err, results) => {

            if (err) {

                return res.status(500).json({

                    message: "Error fetching reviews",

                    error: err

                });

            }

            res.status(200).json(results);

        }

    );

};

exports.getAverageRating = async (req, res) => {

    try {

        const technicianId = req.params.technicianId;

        const result =
            await reviewModel.getAverageRating(technicianId);

        res.status(200).json(result);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching average rating",
            error
        });

    }

};