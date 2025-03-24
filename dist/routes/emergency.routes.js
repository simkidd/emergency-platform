"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const emergency_controller_1 = require("../controllers/emergency.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Emergencies
 *   description: Emergency management
 */
/**
 * @swagger
 * /api/v1/emergencies/create:
 *   post:
 *     summary: Create a new emergency
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - location
 *             properties:
 *               type:
 *                 type: string
 *                 example: medical
 *                 description: Type of emergency (e.g., medical, fire, accident)
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: Point
 *                     description: Type of GeoJSON object (must be "Point")
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [12.34, 56.78]
 *                     description: Coordinates of the emergency location (longitude, latitude)
 *     responses:
 *       201:
 *         description: Emergency created successfully
 *
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create", auth_middleware_1.auth, emergency_controller_1.createEmergency);
/**
 * @swagger
 * /api/v1/emergencies:
 *   get:
 *     summary: Get all emergencies
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter emergencies by status (e.g., pending, resolved)
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based filtering
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based filtering
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radius in kilometers for location-based filtering
 *     responses:
 *       200:
 *         description: List of emergencies
 *
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_middleware_1.auth, emergency_controller_1.getEmergencies);
/**
 * @swagger
 * /api/v1/emergencies/{id}:
 *   get:
 *     summary: Get a specific emergency by ID
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the emergency
 *     responses:
 *       200:
 *         description: Emergency details
 *
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Emergency not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_middleware_1.auth, emergency_controller_1.getEmergencyById);
/**
 * @swagger
 * /api/v1/emergencies/{id}/status:
 *   put:
 *     summary: Update emergency status
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the emergency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: resolved
 *                 description: New status of the emergency
 *     responses:
 *       200:
 *         description: Emergency status updated successfully
 *
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Emergency not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/status", auth_middleware_1.auth, emergency_controller_1.updateEmergencyStatus);
/**
 * @swagger
 * /api/v1/emergencies/{id}:
 *   delete:
 *     summary: Delete an emergency
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the emergency
 *     responses:
 *       200:
 *         description: Emergency deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Emergency not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth_middleware_1.auth, emergency_controller_1.deleteEmergency);
exports.default = router;
