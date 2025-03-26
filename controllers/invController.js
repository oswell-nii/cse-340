const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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

module.exports = invCont
