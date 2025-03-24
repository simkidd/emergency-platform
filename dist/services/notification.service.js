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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdmin = exports.notifyVolunteers = void 0;
const ably_1 = require("../utils/ably");
// Notify volunteers about new emergency
const notifyVolunteers = (emergency, volunteers) => __awaiter(void 0, void 0, void 0, function* () {
    const message = {
        emergencyId: emergency._id,
        type: emergency.type,
        location: emergency.location.coordinates,
        timestamp: new Date().toISOString(),
        urgency: "high",
    };
    yield ably_1.emergencyChannel.publish("emergency-alert", message);
});
exports.notifyVolunteers = notifyVolunteers;
// Notify admin when no volunteers are available
const notifyAdmin = (details) => __awaiter(void 0, void 0, void 0, function* () {
    yield ably_1.emergencyChannel.publish("admin-alert", Object.assign(Object.assign({}, details), { severity: "critical", actionRequired: true }));
});
exports.notifyAdmin = notifyAdmin;
