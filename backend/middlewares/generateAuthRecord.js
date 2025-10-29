const sql = require("../config/db");
const bcrypt = require("bcrypt");

const generateAuthRecord = async ({ email, role, password }) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO auth (email, hashpassword, role)
      VALUES (${email}, ${hashpassword}, ${role})
      RETURNING id
    `;

    return result[0].id;
  } catch (err) {
    throw new Error("Failed to create auth record: " + err.message);
  }
};

module.exports = generateAuthRecord;
