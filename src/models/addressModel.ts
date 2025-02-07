import pool from "../config/database";

interface AddressData {
  address_line_1: string;
  address_line_2: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export const createAddress = async (
  userId: number,
  addressData: AddressData
) => {
  const { address_line_1, address_line_2, area, city, state, pincode } =
    addressData;

  try {
    const result = await pool.query(
      `INSERT INTO address 
                 (user_id, address_line_1, address_line_2, area, city, state, pincode) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
                 RETURNING *`,
      [userId, address_line_1, address_line_2, area, city, state, pincode]
    );
    return {
      error: false,
      message: "Address Added",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Address not Added",
      data: null,
    };
  }
};

export const removeAddress = async (address_id: number, user_id: number) => {
  try {
    const result = await pool.query(
      `DELETE FROM address 
                 WHERE address_id = $1 AND user_id = $2
                 RETURNING *`,
      [address_id, user_id]
    );
    return {
      error: false,
      message: "Address removed",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Address not removed",
      data: null,
    };
  }
};

export const getUserAddresses = async (user_id: number) => {
  try {
    const result = await pool.query(
      `SELECT * FROM address WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return {
        error: true,
        message: "No Address found",
        data: null,
      };
    }
    return {
      error: false,
      message: "Address found",
      data: result.rows,
    };
  } catch (error) {
    return {
      error: true,
      message: "Address not found",
      data: null,
    };
  }
};

export const updateAddress = async (
  address_id: number,
  user_id: number,
  addressData: AddressData
) => {
  const fields = Object.keys(addressData);
  const values = Object.values(addressData);

  if (fields.length === 0) {
    return {
      error: true,
      message: "No fields to update",
      data: null,
    };
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  console.log(setClause);

  try {
    const result = await pool.query(
      `UPDATE address 
       SET ${setClause},updated_at = CURRENT_TIMESTAMP 
       WHERE address_id = $${fields.length + 1} AND user_id = $${
        fields.length + 2
      } 
       RETURNING *`,
      [...values, address_id, user_id]
    );

    if (result.rows.length === 0) {
      return {
        error: true,
        message: "Address not found or not updated",
        data: null,
      };
    }

    return {
      error: false,
      message: "Address updated successfully",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Address not updated",
      data: null,
    };
  }
};
