const reviewModel = require("../models/reviewModel");
const { validationResult } = require("express-validator");

async function postReview(req, res) {
    const { inv_id, review_text } = req.body;
    const account_id = res.locals.accountData.account_id;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // This part is fine (you already render errors in middleware)
    }
  
    try {
      await reviewModel.addReview(inv_id, account_id, review_text);
  
      // ✅ Redirect to the vehicle detail page after successful review
      return res.redirect(`/inventory/detail/${inv_id}`);
    } catch (error) {
      console.error("Review submission error:", error);
      res.status(500).render("error", { message: "Error submitting review." });
    }
  }
  

module.exports = {
  postReview,
};
