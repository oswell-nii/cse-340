const { validationResult } = require("express-validator");
const reviewModel = require("../models/reviewModel");

/**
 * Get reviews for a specific vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getVehicleReviews(req, res) {
  const { inv_id } = req.params;

  try {
    // Fetch reviews and reviewer data from the database
    const query = `
      SELECT 
        r.review_text,
        r.review_date,
        a.account_firstname,
        a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(query, [inv_id]);
    const reviews = result.rows;

    // Pass data to the EJS template
    res.render("vehicle", {
      vehicle: { inv_id }, // Make sure to pass the vehicle data too
      reviews,
      loggedin: req.session.loggedin, // Whether the user is logged in
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Error fetching reviews");
  }
}

/**
 * Add a new review for a vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function addReview(req, res, next) {
  try {
    if (!res.locals.loggedin) {
      req.flash("notice", "You must be logged in to add a review");
      return res.redirect("/account/login");
    }

    // Validate the request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "notice",
        errors
          .array()
          .map((err) => err.msg)
          .join(" ")
      );
      return res.redirect(`/inv/detail/${req.body.inv_id}`);
    }

    // Extract and sanitize data
    const { inv_id, rating, reviewText } = req.body;
    const account_id = res.locals.accountData.account_id;

    const reviewData = {
      account_id,
      inv_id: inv_id,
      rating,
      review_text: reviewText, // Already sanitized by express-validator
      created_at: new Date(),
    };

    const result = await reviewModel.insertReview(reviewData);
    if (result) {
      req.flash("notice", "Review added successfully");
      return res.redirect(`/inv/detail/${inv_id}`);
    } else {
      throw new Error("Failed to add review");
    }
  } catch (error) {
    console.error("Error in addReview:", error);
    req.flash("notice", "Failed to add review");
    next(error);
  }
}

module.exports = {
  getVehicleReviews,
  addReview,
};