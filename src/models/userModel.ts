import pool from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface User {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  date_of_birth: string;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export const findUserByEmail = async (
  email: string
): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return {
      error: false,
      message: "User found successfully",
      data: rows[0] || null,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching user",
      data: null,
    };
  }
};

export const registerUserService = async (
  userData: User
): Promise<ServiceResponse> => {
  try {
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser.data) {
      return {
        error: true,
        message: "User already registered, please Login",
        data: null,
      };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        first_name, last_name, email, password, 
        phone_number, date_of_birth
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING user_id, first_name, last_name, email, phone_number, date_of_birth`,
      [
        userData.first_name,
        userData.last_name,
        userData.email,
        hashedPassword,
        userData.phone_number,
        userData.date_of_birth,
      ]
    );

    return {
      error: false,
      message: "User registered successfully",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error in registration",
      data: null,
    };
  }
};

export const loginUserService = async (
  email: string,
  password: string
): Promise<ServiceResponse> => {
  try {
    const user = await findUserByEmail(email);

    if (!user.data) {
      return {
        error: true,
        message: "Invalid credentials",
        data: null,
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.data.password);
    if (!isValidPassword) {
      return {
        error: true,
        message: "Invalid credentials",
        data: null,
      };
    }

    const token = jwt.sign(
      { user_id: user.data.user_id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return {
      error: false,
      message: "Login successful",
      data: {
        token,
        user: {
          user_id: user.data.user_id,
          email: user.data.email,
        },
      },
    };
  } catch (error) {
    return {
      error: true,
      message: "Error in login",
      data: null,
    };
  }
};

export const getProfileService = async (
  userId: number
): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      "SELECT user_id, first_name, last_name, email, phone_number, date_of_birth FROM users WHERE user_id = $1",
      [userId]
    );

    if (!rows[0]) {
      return {
        error: true,
        message: "User not found",
        data: null,
      };
    }

    return {
      error: false,
      message: "Profile fetched successfully",
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching profile",
      data: null,
    };
  }
};

export const updateUser = async (user_id: number, userData: User) => {
  const fields = Object.keys(userData);
  const values = Object.values(userData);

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

  try {
    const result = await pool.query(
      `UPDATE users 
           SET ${setClause} ,updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $${fields.length + 1} 
           RETURNING *`,
      [...values, user_id]
    );

    if (result.rows.length === 0) {
      return {
        error: true,
        message: "User not found or not updated",
        data: null,
      };
    }

    return {
      error: false,
      message: "User updated successfully",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "User not updated",
      data: null,
    };
  }
};
