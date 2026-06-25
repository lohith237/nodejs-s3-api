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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.Login = exports.createUser = void 0;
const s3_1 = require("../../config/s3");
const modals_1 = require("../modals");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../utils/sendEmail");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, password } = req.body;
        const existUser = yield modals_1.User.findOne({ email });
        if (existUser) {
            yield (0, s3_1.deleteFromS3)(req.file);
            return res.status(400).json({ message: "User Alredy Exists" });
        }
        const user = yield modals_1.User.create({
            name, email, password, image: req.file ? (_a = req.file) === null || _a === void 0 ? void 0 : _a.location : null
        });
        res.status(201).json({ message: "user Created", user });
    }
    catch (error) {
        yield (0, s3_1.deleteFromS3)(req.file);
        res.status(500).json({ message: "internal server" });
    }
});
exports.createUser = createUser;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existUser = yield modals_1.User.findOne({ email });
        if (!existUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = existUser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        yield (0, sendEmail_1.sendEmail)(existUser.email, 'Login Successful', `Hi ${existUser.name}, you have successfully logged in to your account.`);
        const token = yield jsonwebtoken_1.default.sign({ user_id: existUser === null || existUser === void 0 ? void 0 : existUser._id, role: existUser.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.status(200).json({ message: "Login success", user: existUser, token: token });
    }
    catch (error) {
        yield (0, s3_1.deleteFromS3)(req.file);
        res.status(500).json({ message: "internal server" });
    }
});
exports.Login = Login;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield modals_1.User.find({});
        res.status(200).json({ message: "", users });
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" });
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield modals_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User Not found" });
        }
        res.status(200).json({ message: "", user });
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" });
    }
});
exports.getUserById = getUserById;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, password } = req.body;
        const existUser = yield modals_1.User.findById(req.params.id);
        if (!existUser) {
            yield (0, s3_1.deleteFromS3)(req.file);
            return res.status(404).json({ message: "User Not Found" });
        }
        if (email !== existUser.email) {
            const emailTaken = yield modals_1.User.findOne({ email });
            if (emailTaken) {
                yield (0, s3_1.deleteFromS3)(req.file);
                return res.status(400).json({ message: "user Already Exists" });
            }
        }
        yield (0, s3_1.replaceS3Image)(existUser === null || existUser === void 0 ? void 0 : existUser.image);
        const updateUser = yield modals_1.User.findByIdAndUpdate(req.params.id, { $set: { email, name, password, image: req.file ? req.file.location : existUser.image } }, { returnDocument: 'after' });
        res.status(200).json({ message: "user Updated SuccessFully", user: updateUser });
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existUser = yield modals_1.User.findById(req.params.id);
        if (!existUser) {
            return res.status(404).json({ message: "User Not Found" });
        }
        if (existUser.image) {
            const key = existUser.image.split('.com/')[1];
            yield s3_1.s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();
        }
        yield (0, s3_1.replaceS3Image)(existUser === null || existUser === void 0 ? void 0 : existUser.image);
        yield modals_1.User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" });
    }
});
exports.deleteUser = deleteUser;
