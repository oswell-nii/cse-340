// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')


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



module.exports = router;