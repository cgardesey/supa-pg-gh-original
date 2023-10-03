const express = require('express');
const checkAuthMiddleware = require('../middleware/check-auth');

const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *    Welcome Bundle Package:
 *       type: object
 *       required:
 *         - token
 *         - userid
 *         - msisdn
 *       properties:
 *         token:
 *           type: string
 *           description: API token provided by API provider
 *         userid:
 *           type: string
 *           description: User id
 *         msisdn:
 *           type: string
 *           description: MTN phone number
 *       example:
 *         token: <API token>
 *         userid: "74"
 *         msisdn: "233546676098"
 */

/**
 * @swagger
 * /welcome-bundle-package:
 *   post:
 *     description: Sends a welcome bundle package to the given phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Welcome Bundle Package'
 *     responses:
 *       500:
 *         description: Some server error occurred. (May include a message body indicating the cause of the error)
 *       401:
 *         description: Unauthorized. (Indicates that token is invalid)
 *       400:
 *         description: Bad request. (Indicates that some required fields were not provided)
 *       204:
 *         description: Success response
 */
router.post("/", checkAuthMiddleware.checkAuth, (req, res) => {
    try {
        if (req.body.userid == null) {
            return res.status(400).json({
                "message": "Validation failed",
                "errors": [
                    {
                        "type": "required",
                        "message": "The 'userid' field is required.",
                        "field": "userid"
                    }
                ]
            });
        }
        if (req.body.msisdn == null) {
            return res.status(400).json({
                "message": "Validation failed",
                "errors": [
                    {
                        "type": "required",
                        "message": "The 'msisdn' field is required.",
                        "field": "msisdn"
                    }
                ]
            });
        }
        res.status(204).json();
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
});

module.exports = router;
