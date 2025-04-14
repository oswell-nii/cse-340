const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}


  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
}


/* ******************************
 * Login Data Validation Rules
 * ***************************** */
validate.loginRules = () => {
  return [
    // Email must be valid
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

    // Password must not be empty
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}


/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}
// Update account data validation rules
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .escape()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
  ];
};

// Check if the account update data is valid
validate.checkUpdateData = async (req, res, next) => {
  const { account_id, account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update-account", {
      errors: errors.array(), // FIXED LINE
      title: "Update Account",
      accountData,
    });
    return;
  }
  
  // Check if the email is already in use (if it has been changed)
  const existingAccount = await accountModel.getAccountByEmail(account_email);
  if (existingAccount && existingAccount.account_id !== parseInt(account_id)) {
    req.flash("notice", "Email is already in use.");
    return res.redirect(`/account/update/${account_id}`);
  }

  next();
};

// Password validation rules
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

// Check if the password data is valid
validate.checkPasswordData = async (req, res, next) => {
  const { account_id, account_password } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update-account", {
      errors,
      title: "Update Account",
      accountData,
    });
    return;
  }

  next();
};



module.exports = validate