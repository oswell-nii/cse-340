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

/* ***************************
 *  Insert new classification
 * ************************** */
async function insertClassification(classificationName) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id`;
    const result = await pool.query(sql, [classificationName]);
    return result.rows[0];
  } catch (error) {
    console.error("insertClassification error: " + error);
    throw error;
  }
}

/* ***************************
 *  Insert new inventory item
 * ************************** */
async function insertInventory(inventoryData) {
  try {
    const sql = `
      INSERT INTO public.inventory (
       
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
       
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id
    `;
    const params = [
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail,
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.classification_id,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error("insertInventory error: " + error);
    console.error("Inventory data: " + JSON.stringify(inventoryData));
    console.error(error.stack);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

// Group all functions into an object for export
const invModel = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory,
  updateInventory
};

module.exports = invModel;




