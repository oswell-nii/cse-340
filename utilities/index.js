const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid += `<a href="/inv/detail/${vehicle.inv_id}"
                   data-id="${vehicle.inv_id}" 
                   data-make="${vehicle.inv_make}" 
                   data-model="${vehicle.inv_model}" 
                   data-year="${vehicle.inv_year}"
                   data-price="${vehicle.inv_price}" 
                   data-image="${vehicle.inv_image}" 
                   data-description="${vehicle.inv_description}">
                  <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
                  <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
                  <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
               </a>`;
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************** */
Util.buildVehicleDetail = function (vehicle) {
  let detail = `<div class="vehicle-detail">`
  detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" class="vehicle-image" />`
  detail += `<h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>`
  detail += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`
  detail += `<p><strong>Year:</strong> ${vehicle.inv_year}</p>`
  detail += `<p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>`
  detail += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`
  detail += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`
  detail += `</div>`

  return detail
}


module.exports = Util