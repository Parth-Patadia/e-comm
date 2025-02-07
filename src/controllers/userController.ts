import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  getProfileService,
  updateUser,
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

export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.user_id;
    const userData = req.body;

    const updatedUser = await updateUser(user_id, userData);

    if (updatedUser.error) {
      res.status(404).json({
        error: true,
        message: updatedUser.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: updatedUser.message,
      data: updatedUser.data,
    });
  } catch (error) {
    console.error("Error in update User:", error);
    res.status(500).json({
      error: true,
      message: "Failed to update User",
      data: error,
    });
  }
};
