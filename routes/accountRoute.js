// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to deliver Registration View
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//Route to deliver Register Account
router.post('/register', utilities.handleErrors(accountController.registerAccount))


module.exports = router;