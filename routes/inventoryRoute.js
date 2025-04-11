// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const inventoryValidation = require("../utilities/inventory-validation");
const Util = require("../utilities");
const adminEmployeeAccess = require("../middleware/checkAdminAccess");

// Inventory Management Views
router.get("/", invController.renderManagementView);

// Public Routes (No Middleware Required)
router.get("/type/:classificationId", invController.buildByClassificationId); // Classification view
router.get("/detail/:inv_id", invController.getInventoryDetail);              // Vehicle detail view

// Restricted Routes (Requires Admin/Employee Access)
router.get("/admin", adminEmployeeAccess, (req, res) => {
    res.render('adminView'); // Render admin-specific view
});

router.post("/add-inventory", 
    adminEmployeeAccess, 
    inventoryValidation.inventoryRules(), 
    inventoryValidation.checkInventoryData, 
    invController.addInventory
);

router.post("/update", 
    adminEmployeeAccess, 
    inventoryValidation.inventoryRules(), 
    inventoryValidation.checkInventoryData, 
    Util.handleErrors(invController.updateInventory)
);

router.get("/edit/:inv_id", adminEmployeeAccess, Util.handleErrors(invController.editInventoryView)); 

// Classification Management Routes
router.get("/add-classification", adminEmployeeAccess, invController.buildAddClassification);
router.post(
    "/add-classification", 
    adminEmployeeAccess, 
    inventoryValidation.classificationRules(), 
    inventoryValidation.checkClassificationData, 
    invController.addClassification
);

// Public JSON Data Route
router.get("/getInventory/:classification_id", Util.handleErrors(invController.getInventoryJSON));

// Error Testing Route
router.get("/trigger-error", (req, res, next) => {
    next(new Error("Intentional Server Error!"));
});

// Export Routes
module.exports = router;