const { body, validationResult } = require("express-validator")
const utilities = require(".")

const reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .notEmpty()
      .withMessage("Review text cannot be empty.")
      .isLength({ min: 5 })
      .withMessage("Review must be at least 5 characters long."),
  ]
}

const checkReviewData = async (req, res, next) => {
  const errors = validationResult(req)
  const { inv_id, review_text } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const vehicleData = await require("../models/inventory-model").getVehicleById(inv_id)
    const vehicleDetail = utilities.buildVehicleDetail(vehicleData)
    const reviews = await require("../models/reviewModel").getReviewsByInvId(inv_id)

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleDetail,
      reviews,
      inv_id,
      errors: errors.array(),
      review_text,
    })
    return
  }

  next()
}

module.exports = { reviewRules, checkReviewData }
