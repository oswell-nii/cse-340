const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const checkJWTToken = require('../middleware/checkJWTToken');


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  const message = req.flash("notice");
  res.render("account/login", {
    title: "Login",
    nav,
    message
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  const message = req.flash("notice"); 
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.redirect("/account/login"); // Redirect instead of render
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.redirect("/account/register"); // Redirect instead of render
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    // ✅ FIXED: Pass message when email is not found
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      message: "Email not found."
    });
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    } else {
      // ✅ FIXED: Pass message when password is incorrect
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        message: "Invalid password. Please check your credentials and try again."
      });
    }
  } catch (error) {
    next(error);
  }
}

async function buildAccountHome(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    message: "You're logged in",
    errors: null,
    messages: req.flash(),
    accountData: res.locals.accountData,
  });
}




/* ****************************************
 *  Show the update account form
 * *************************************** */
async function showUpdateForm(req, res) {
  const accountId = parseInt(req.params.accountId);
  let nav = await utilities.getNav();

  try {
    const accountData = await accountModel.getAccountById(accountId);

    if (!accountData) {
      return res.status(404).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: null,
        loggedin: true,
        message: "Account not found.",
      });
    }

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      loggedin: true,
    });
  } catch (error) {
    console.error("Error fetching account data:", error);
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      accountData: null,
      loggedin: true,
      message: "Error loading update form.",
    });
  }
}

/* ****************************************
 *  Handle account update process
 * *************************************** */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let nav = await utilities.getNav();

  try {
    const updatedAccount = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updatedAccount) {
      req.flash("notice", "Account successfully updated.");
      console.log("✅ Update successful, redirecting to /account");
      res.redirect(`/account`);
    } else {
      req.flash("notice", "Error updating account information.");
      const accountData = await accountModel.getAccountById(account_id);
      res.render("account/update-account", {
        title: "Update Account",
        nav,
        accountData,
        loggedin: true,
        message: "There was an error updating your information.",
      });
    }
  } catch (error) {
    req.flash("notice", "Error updating account information.");
    console.error("Error updating account:", error);
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      loggedin: true,
      message: "There was an error updating your information.",
    });
  }
}

async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password successfully updated.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed.");
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(account_id);
      res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData,
        message: "There was a problem updating your password.",
      });
    }
  } catch (err) {
    console.error("Error updating password:", err);
    req.flash("notice", "There was a server error updating your password.");
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      message: "Server error. Please try again later.",
    });
  }
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountHome,
  showUpdateForm,
  updateAccount,
  updatePassword
};

