const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a specific vehicle by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    console.log("Fetching vehicle with ID:", inv_id); // Debugging

    const data = await pool.query(
      `SELECT * FROM public.inventory 
      WHERE inv_id = $1`,
      [inv_id]
    );
    console.log("Query result:", data.rows); // Debugging

    return data.rows[0]; // Return a single vehicle
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

async function buildClassificationList(classification_id = null) {
  const classifications = await invModel.getClassifications(); // Fetch classifications from the database
  let classificationList = '<select name="classification_id" id="classification_id" required>';
  classificationList += '<option value="">Select a Classification</option>';

  classifications.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    if (classification_id !== null && row.classification_id === classification_id) {
      classificationList += ' selected';
    }
    classificationList += `>${row.classification_name}</option>`;
  });

  classificationList += '</select>';
  return classificationList; // Return the complete dropdown HTML
}




module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, buildClassificationList };
