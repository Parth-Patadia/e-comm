import { Request, Response } from "express";
import {
  createAddress,
  removeAddress,
  getUserAddresses,
} from "../models/addressModel";

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.user_id;
    const addressData = {
      address_line_1: req.body.address_line_1,
      address_line_2: req.body.address_line_2,
      area: req.body.area,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
    };

    const newAddress = await createAddress(userId, addressData);
    res
      .status(201)
      .json({ error: false, message: "Address Added", data: newAddress });
  } catch (error) {
    console.error("Error in addAddress:", error);
    res.status(500).json({
      error: true,
      message: "Failed to Add an Address",
      data: error,
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.user_id;
    const address_id = parseInt(req.params.id);

    const deletedAddress = await removeAddress(address_id, userId);

    if (!deletedAddress) {
      res.status(404).json({
        error: true,
        message: "Address not found",
        data: deleteAddress,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: "Address deleted successfully",
      data: deleteAddress,
    });
  } catch (error) {
    console.error("Error in deleting Address:", error);
    res.status(500).json({
      error: true,
      message: "Failed to delete an Address",
      data: error,
    });
  }
};

export const allAddress = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.user_id;
    const addresses = await getUserAddresses(user_id);

    if (!addresses) {
      res.status(404).json({
        error: true,
        message: "Address not found",
        data: addresses,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: "All Addresses",
      data: addresses.data,
    });
  } catch (error: unknown) {
    console.error("Error in getUserAddresses:", error);
    res.status(500).json({
      error: true,
      message: "Failed to get UserAddresses",
      data: error,
    });
  }
};
