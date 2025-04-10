const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const inventoryValidation = require("../utilities/inventory-validation"); // Adjust the path as needed
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.getInventoryDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id; // Get vehicle ID from URL
  const vehicleData = await invModel.getVehicleById(inv_id); // Fetch vehicle details

  if (!vehicleData) {
    return res.status(404).render("inventory/detail", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
      message: "Sorry, this vehicle does not exist.",
    });
  }

  const vehicleDetail = utilities.buildVehicleDetail(vehicleData); // Generate HTML for vehicle

  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav: await utilities.getNav(),
    vehicleDetail,
  });
};

/* ***************************
 *  Render Inventory Management View
 * ************************** */
invCont.renderManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: { success: req.flash("success"), error: req.flash("error") }, // Ensure messages are passed correctly
    errors: [],
    Util: utilities, // Pass the utilities module to the view
    classification_id: null,
    classificationSelect, // Or set a default/fallback if appl
  });
};

// Add Classification View
invCont.buildAddClassification = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            messages: req.flash()
        })
    } catch (error) {
        next(error)
    }
}

invCont.addClassification = async function (req, res, next) {
  try {
      const { classificationName } = req.body;
      
      if (!classificationName) {
          throw new Error("Classification name is required");
      }

      const result = await invModel.insertClassification(classificationName);
      let nav = await utilities.getNav();

      if (result) {
          req.flash("success", "Classification added successfully");
          res.render("./inventory/management", {
              title: "Inventory Management",
              nav,
              messages: req.flash(),
          });
      } else {
          req.flash("error", "Error adding classification");
          res.render("./inventory/add-classification", {
              title: "Add New Classification",
              nav,
              errors: [{ msg: "Failed to add classification" }],
          });
      }
  } catch (error) {
      let nav = await utilities.getNav();
      req.flash("error", error.message);
      res.render("./inventory/add-classification", {
          title: "Add New Classification",
          nav,
          errors: [{ msg: error.message }],
      });
  }
};

// Add Inventory View
invCont.buildAddInventory = async function (req, res, next) {
  try {
      let nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(); // Get latest classifications
      res.render("./inventory/add-inventory", {
          title: "Add Inventory",
          nav,
          classifications: classificationList, // Pass the dropdown list
          errors: [],
          stickyData: {},
          messages: { error: req.flash("error") },
          classificationSelect,
        });
  } catch (error) {
      next(error);
  }
};



// Method to handle Add New Inventory form submission
invCont.addInventory = async function (req, res, next) {
  try {
      const {
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id,
      } = req.body;

      if (!classification_id) {
          throw new Error("Classification is required");
      }

      const inventoryData = {
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price: Math.round(parseFloat(inv_price)),
          inv_miles: parseInt(inv_miles, 10),
          inv_color,
          classification_id: parseInt(classification_id, 10),
      };

      const result = await invModel.insertInventory(inventoryData);
      let nav = await utilities.getNav();

      if (result) {
          req.flash("success", `The ${inv_model} ${inv_make} was added successfully.`);
          res.redirect("/inv");
      } else {
          req.flash("error", `Error adding ${inv_make} ${inv_model}.`);
          res.status(500).render("./inventory/add-inventory", {
              title: "Add New Inventory",
              nav,
              classifications: await utilities.buildClassificationList(),
              errors: [],
              stickyData: inventoryData,
          });
      }
  } catch (error) {
      let nav = await utilities.getNav();
      req.flash("error", `Error adding ${req.body.inv_make} ${req.body.inv_model}.`);
      res.status(500).render("./inventory/add-inventory", {
          title: "Add New Inventory",
          nav,
          classifications: await utilities.buildClassificationList(req.body.classification_id),
          errors: [{ msg: error.message }],
          stickyData: req.body,
      });
  }
};

invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classification_id;
  const inventoryData = await invModel.getInventoryByClassificationId(classification_id);
  if (!inventoryData || inventoryData.length === 0) {
    return res.status(404).json({ message: "No inventory found for this classification." });
  }
  res.json(inventoryData);
};



module.exports = invCont;