"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticateUser, categoryController_1.createCategory);
router.get('/', categoryController_1.getAllCategories);
router.put('/:id', auth_1.authenticateUser, categoryController_1.updateCategory);
exports.default = router;
