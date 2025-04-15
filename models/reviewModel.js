const pool = require("../database/");
const { logger } = require("../utilities/logger");

/**
 * Review Model - Handles database operations for vehicle reviews
 */

/**
 * Get all reviews for a specific vehicle
 * @param {number} inv_id - The ID of the vehicle to get reviews for
 * @returns {Promise<Array>} - Array of review objects
 */
async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname 
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);

    return result.rows;
  } catch (error) {
    logger.error(
      `Error retrieving reviews for vehicle ${inv_id}: ${error.message}`
    );
    throw new Error(`Unable to get reviews: ${error.message}`);
  }
}

/**
 * Insert a new review into the database
 * @param {Object} reviewData - Object containing review data
 * @param {number} reviewData.inv_id - ID of the vehicle being reviewed
 * @param {number} reviewData.account_id - ID of the account submitting the review
 * @param {string} reviewData.review_text - Text content of the review
 * @returns {Promise<Object>} - The newly created review
 */
async function insertReview(reviewData) {
  try {
    const sql = `
      INSERT INTO reviews (
        inv_id, account_id, 
        review_text, 
        review_date
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const params = [
      reviewData.inv_id,
      reviewData.account_id,
      reviewData.review_text,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error inserting review: ${error.message}`);
    throw new Error(`Unable to add review: ${error.message}`);
  }
}

module.exports = {
  getReviewsByVehicleId,
  insertReview,
};
