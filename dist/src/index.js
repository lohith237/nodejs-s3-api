"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: ".env.staging"
});
const ConnectDB_1 = require("../config/ConnectDB");
const routes_1 = require("./routes");
(0, ConnectDB_1.ConnectDB)();
const App = (0, express_1.default)();
App.use((0, cors_1.default)());
App.use(express_1.default.json());
App.get("/", (req, res) => {
    res.send("Hello world");
});
App.use("/api/users", routes_1.UserRoute);
App.listen(process.env.PORT || 3000, () => {
    console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
});
