const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/*
 * Classification Data Validation Rules
 * Ensures the classificationName field is not empty and only contains alphanumeric characters
 */
validate.classificationRules = () => {
  return [
    body("classificationName")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required")
      .isAlphanumeric()
      .withMessage(
        "Classification name must not contain spaces or special characters"
      ),
  ];
};

/*
 * Check validation results for classification data.
 * If errors exist, render the 'add-classification' form with error messages and persist entered data.
 */
validate.checkClassificationData = async (req, res, next) => {
  const { classificationName } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classificationName,
    });
  } else {
    next();
  }
};

/*
 * Inventory Data Validation Rules
 * Validates all required fields for adding a new inventory item
 */
validate.inventoryRules = () => {
  return [
    // Ensures that the classification_id field, selected from the dropdown, is not empty and is a valid number.
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification is required")
      .isNumeric(),
    body("inv_make").trim().escape().notEmpty().withMessage("Make is required"),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required"),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Year is required")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be 4 digits")
      .isNumeric()
      .withMessage("Year must be a number")
      .custom((value) => {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          throw new Error(`Year must be between 1900 and ${currentYear}`);
        }
        return true;
      }),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required"),
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Image path is required"),
    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Thumbnail path is required"),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number"),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Miles is required")
      .isNumeric()
      .withMessage("Miles must be a number"),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required"),
  ];
};

/*
 * Check validation results for inventory data.
 * If errors exist, render the 'add-inventory' form with error messages and persist entered data.
 */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      let classifications = await utilities.buildClassificationList(req.body.classification_id);

      // Collect all error messages in an array
      let flashErrors = errors.array().map(error => error.msg);

      // Store all errors as a flash message array
      req.flash("errorList", flashErrors);

      res.render("inventory/add-inventory", {
          title: "Add New Inventory",
          nav,
          classifications,
          errors: errors.array(),
          stickyData: req.body,
          messages: { errorList: req.flash("errorList") } // Retrieve stored flash errors
      });
  } else {
      next();
  }
};


validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);

  // Destructure variables from the request body, including inv_id
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classifications = await utilities.buildClassificationList(classification_id);

    // Collect error messages
    const flashErrors = errors.array().map(error => error.msg);
    req.flash("errorList", flashErrors);

    res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`, // Matches controller title
      nav,
      classificationSelect: classifications,
      errors: errors.array(),
      messages: { errorList: req.flash("errorList") },
      inv_id, // Ensures inv_id is available in the view
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    });
  } else {
    next();
  }
};


module.exports = validate;