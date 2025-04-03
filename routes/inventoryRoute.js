// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const inventoryValidation = require("../utilities/inventory-validation");

// Route to render the inventory management view
router.get("/", invController.renderManagementView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for Inventory Detail View (Dynamically fetches a vehicle by ID)
router.get("/detail/:inv_id", invController.getInventoryDetail);

// Route to render Add New Inventory form
router.get("/add-inventory", invController.buildAddInventory);

// Route to handle Add New Inventory form submission
router.post(
    "/add-inventory",
    inventoryValidation.inventoryRules(),
    inventoryValidation.checkInventoryData,
    invController.addInventory
);

router.get("/add-classification", invController.buildAddClassification);

router.post(
    "/add-classification",
    inventoryValidation.classificationRules(), 
    inventoryValidation.checkClassificationData, 
    invController.addClassification
);
// Route to trigger an intentional 500 error
router.get("/trigger-error", (req, res, next) => {
    next(new Error("Intentional Server Error!"));
  });
  

module.exports = router;