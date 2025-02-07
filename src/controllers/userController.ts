// import { Request, Response, NextFunction } from "express";
// import pool from "../config/database";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { findUserByEmail, createUser, profile } from "../models/userModel";

// dotenv.config();

// interface AuthRequest extends Request {
//   user?: { user_id: number };
// }

// export const registerUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const {
//       first_name,
//       last_name,
//       email,
//       password,
//       phone_number,
//       date_of_birth,
//     } = req.body;

//     const userExists = await findUserByEmail(email);

//     if (userExists.error) {
//       res;
//     }

//     if (userExists) {
//       res.status(400).json({
//         message: "User already registered, please Login",
//       });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = createUser(
//       first_name,
//       last_name,
//       email,
//       hashedPassword,
//       phone_number,
//       date_of_birth
//     );

//     res.status(201).json({
//       message: "User Registered successfully",
//     });
//     return;
//   } catch (err) {
//     //console.log(err);
//     res.status(500).json({
//       message: "Error in Registration",
//       err,
//     });
//   }
// };

// export const loginUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       res.status(400).json({
//         message: "Email and password are required",
//       });
//       return;
//     }

//     const user = await findUserByEmail(email);

//     if (!user) {
//       res.status(400).json({
//         message: "Invalid credentials",
//       });
//       return;
//     }

//     const checkPassword = await bcrypt.compare(password, user.data.password);

//     if (!checkPassword) {
//       res.status(400).json({
//         message: "Invalid credentials",
//       });
//       return;
//     }

//     const token = jwt.sign(
//       { user_id: user.data.user_id },
//       process.env.JWT_SECRET as string,
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         user_id: user.data.user_id,
//         email: user.data.email,
//       },
//     });
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({
//       message: "Error in Login",
//     });
//   }
// };

// export const getUserProfile = async (req: Request, res: Response) => {
//   try {
//     const user_id = (req as any).user.user_id;

//     const userDetails = await profile(user_id);

//     res.status(200).json({
//       message: "User Details",
//       Details: userDetails,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch User details",
//       error,
//     });
//   }
// };

//------------------------------------------------------------------------------------------------------
import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  getProfileService,
} from "../models/userModel";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await registerUserService(req.body);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error in registration",
      data: null,
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: true,
        message: "Email and password are required",
        data: null,
      });
      return;
    }

    const result = await loginUserService(email, password);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error in login",
      data: null,
    });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.user_id;
    const result = await getProfileService(userId);

    if (result.error) {
      res.status(404).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error fetching profile",
      data: null,
    });
  }
};
