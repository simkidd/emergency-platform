import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import {
  createVolunteerProfile,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteerProfile,
  toggleAvailability,
  searchVolunteersBySkills,
  getAvailableVolunteers,
} from "../controllers/volunteer.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Volunteers
 *   description: Volunteer profile management endpoints
 */

/**
 * @swagger
 * /api/v1/volunteers:
 *   post:
 *     summary: Create a volunteer profile
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - skills
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user creating the volunteer profile
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of volunteer's skills
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *                 description: Availability status
 *             example:
 *               userId: "507f1f77bcf86cd799439011"
 *               skills: ["teaching", "first aid"]
 *               isAvailable: true
 *     responses:
 *       201:
 *         description: Volunteer profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 volunteer:
 *                   type: object
 *       400:
 *         description: Bad request (user not volunteer or profile exists)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", auth, createVolunteerProfile);

/**
 * @swagger
 * /api/v1/volunteers:
 *   get:
 *     summary: Get all volunteers
 *     tags: [Volunteers]
 *     responses:
 *       200:
 *         description: List of all volunteers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                   isAvailable:
 *                     type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllVolunteers);

/**
 * @swagger
 * /api/v1/volunteers/{id}:
 *   get:
 *     summary: Get volunteer profile by ID
 *     tags: [Volunteers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Volunteer profile ID
 *     responses:
 *       200:
 *         description: Volunteer profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isAvailable:
 *                   type: boolean
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getVolunteerById);

/**
 * @swagger
 * /api/v1/volunteers/{id}:
 *   patch:
 *     summary: Update volunteer profile
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Volunteer profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of skills
 *               isAvailable:
 *                 type: boolean
 *                 description: Updated availability status
 *             example:
 *               skills: ["teaching", "first aid", "counseling"]
 *     responses:
 *       200:
 *         description: Volunteer profile updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", auth, updateVolunteerProfile);

/**
 * @swagger
 * /api/v1/volunteers/{id}/availability:
 *   patch:
 *     summary: Toggle volunteer availability status
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Volunteer profile ID
 *     responses:
 *       200:
 *         description: Availability status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isAvailable:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/availability", auth, toggleAvailability);

/**
 * @swagger
 * /api/v1/volunteers/search:
 *   get:
 *     summary: Search volunteers by skills
 *     tags: [Volunteers]
 *     parameters:
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         required: true
 *         description: Comma-separated list of skills to search for
 *     responses:
 *       200:
 *         description: List of matching volunteers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                   isAvailable:
 *                     type: boolean
 *       400:
 *         description: Skills parameter missing
 *       500:
 *         description: Internal server error
 */
router.get("/search", searchVolunteersBySkills);

/**
 * @swagger
 * /api/v1/volunteers/available:
 *   get:
 *     summary: Get all available volunteers
 *     tags: [Volunteers]
 *     responses:
 *       200:
 *         description: List of available volunteers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
router.get("/available", getAvailableVolunteers);

export default router;
