"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyChannel = void 0;
const ably_1 = __importDefault(require("ably"));
const environments_1 = require("../config/environments");
const { ABLY_API_KEY } = environments_1.environments;
const ably = new ably_1.default.Realtime(ABLY_API_KEY);
ably.connection.once("connected", () => {
    console.log("Connected to Ably!");
});
exports.emergencyChannel = ably.channels.get("emergencies");
exports.default = ably;
