// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to render the inventory management view
router.get("/inv", invController.renderManagementView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for Inventory Detail View (Dynamically fetches a vehicle by ID)
router.get("/detail/:inv_id", invController.getInventoryDetail);

// Route to trigger an intentional 500 error
router.get("/trigger-error", (req, res, next) => {
    next(new Error("Intentional Server Error!"));
  });
  

module.exports = router;