const invModel = require("../models/inventory-model")
const reviewModel = require("../models/reviewModel");
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
  const inv_id = req.params.inv_id;
  const vehicleData = await invModel.getVehicleById(inv_id);
  const reviews = await reviewModel.getReviewsByVehicleId(inv_id);

  if (!vehicleData) {
    return res.status(404).render("inventory/detail", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
      message: "Sorry, this vehicle does not exist.",
    });
  }

  const vehicleDetail = utilities.buildVehicleDetail(vehicleData);

  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav: await utilities.getNav(),
    inv_id: req.params.inv_id, // <-- Make sure this is here
    vehicleDetail,
    vehicle: vehicleData, // <-- Add this line

    loggedIn: res.locals.loggedIn,
    reviews,
    messages: req.flash("success"),
    errors: []
  });
}

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

/* ***************************
 *  Render Edit Inventory Form
 * ************************** */
invCont.renderEditInventoryForm = async function (req, res, next) {
  try {
    // Get the inventory ID from the URL parameters
    const inv_id = req.params.inv_id;

    // Fetch the vehicle data by inv_id
    const vehicleData = await invModel.getVehicleById(inv_id);

    // If the vehicle data is not found, return a 404 error
    if (!vehicleData) {
      return res.status(404).render("inventory/edit", {
        title: "Vehicle Not Found",
        nav: await utilities.getNav(),
        message: "Sorry, this vehicle does not exist.",
      });
    }

    // Fetch the list of classifications to populate the dropdown
    const classificationList = await utilities.buildClassificationList();

    // Render the edit form with the vehicle data
    res.render("inventory/edit", {
      title: `Edit ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav: await utilities.getNav(),
      vehicleData,  // Pass vehicle data to the form
      classificationList, // Pass classification options to the form
      errors: [],  // Placeholder for any validation errors
    });
  } catch (error) {
    next(error); // Pass the error to the error handler
  }
};


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  // Parse the inventory_id from the request parameters
  const inv_id = parseInt(req.params.inv_id)

  try {
    // Get the navigation HTML
    let nav = await utilities.getNav()

    // Get the item data from the model using the inv_id
    const itemData = await invModel.getVehicleById(inv_id)

    // Build the classification select list using the current classification_id
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    // Combine the make and model for the title
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    // Render the view with the data
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName, // Set the page title dynamically
      nav, // Include the navigation
      classificationSelect, // Include the classification dropdown
      errors: null, // No errors initially
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    next(error) // Pass any error to the error-handling middleware
  }
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
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
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}
module.exports = invCont;