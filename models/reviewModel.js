const pool = require('../database/');

async function addReview(inv_id, account_id, review_text) {
  try {
    const sql = `
      INSERT INTO reviews (inventory_id, account_id, review_text)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_text]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error adding review: " + error.message);
  }
}

async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT r.review_id, r.review_text, r.review_date, a.account_firstname, a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC;
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    throw new Error("Error getting reviews: " + error.message);
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId
};
