// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const checkJWTToken = require('../middleware/checkJWTToken'); // ✅ This should now work



// Route to deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to deliver Registration View
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Default route for logged-in accounts
router.get("/",
    utilities.checkLogin,
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.buildAccountHome)
  )
  
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)


// Show the update account view
router.get('/update/:accountId', utilities.checkLogin, checkJWTToken, utilities.handleErrors(accountController.showUpdateForm));

// Process account update request
router.post(
  '/update',
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process password change request
router.post(
  '/update-password',
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);


// Logout route
router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.locals.loggedin = false;
    res.locals.accountData = null;
    req.flash("notice", "You have successfully logged out.");
    res.redirect("/");
  });
  

module.exports = router;




