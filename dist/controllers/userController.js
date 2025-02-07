"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, email, password, phone_number, date_of_birth, } = req.body;
        if (!first_name || !email || !password) {
            res.status(400).json({
                message: "Name, Email and Password are required",
            });
        }
        const userExists = yield database_1.default.query(`select * from users where email = $1`, [email]);
        if (userExists.rows.length > 0) {
            res.status(400).json({
                message: "User already registered, please Login",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield database_1.default.query(`insert into users(first_name,last_name,email,password,phone_number,date_of_birth) values(
        $1,$2,$3,$4,$5,$6
    ) returning *`, [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone_number,
            date_of_birth,
        ]);
        res.status(201).json({
            message: "User Registered successfully",
            user: {
                newUser,
            },
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Error in Registration",
            err,
        });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.loginUser = loginUser;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.getUserProfile = getUserProfile;
