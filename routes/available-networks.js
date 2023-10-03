const express = require('express');
const checkAuthMiddleware = require('../middleware/check-auth');

const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Available Networks:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: API token provided by API provider
 *       example:
 *         token: <API token>
 */

/**
 * @swagger
 * /available-networks:
 *   post:
 *     description: Returns a list of available networks in Ghana
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Available Networks'
 *     responses:
 *       500:
 *         description: Some server error occurred. (May include a message body indicating the cause of the error)
 *       200:
 *         description: |
 *           **Sample Output**
 *           ```
 *           [
 *              "ARTLTIGO",
 *              "MTN",
 *              "VODAFONE"
 *           ]
 */
router.post("/", checkAuthMiddleware.checkAuth, (req, res) => {
    res.status(200).json([
        "ARTLTIGO",
        "MTN",
        "VODAFONE"
    ])
});

module.exports = router;
