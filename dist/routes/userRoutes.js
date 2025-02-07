"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { 
//   registerUser, 
//   loginUser, 
//   getUserProfile   
// } from '../controllers/userController';
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.post('/register', userController_1.registerUser);
// router.post('/login', loginUser);
// router.get('/profile', authenticateUser, getUserProfile);
exports.default = router;
