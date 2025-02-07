"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('api/auth', userRoutes_1.default);
app.use('api/category', categoryRoutes_1.default);
// app.use('api/product',productRoute);
// app.use('api/cart',categoryRoute);
// app.use('api/order',categoryRoute);
// app.use('api/return',categoryRoute);
// app.use('api/category',categoryRoute);
app.listen(3000, () => {
    console.log("Server is running...");
});
