const express = require('express');
const checkAuthMiddleware = require('../middleware/check-auth');
const validatePaymentRequest = require('../middleware/payment-method').validatePaymentRequest;
const save = require('../controllers/payment.controller').save;
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *    Extra Bundle Package:
 *       type: object
 *       required:
 *         - token
 *         - requestid
 *         - name
 *         - payerid
 *         - msisdn
 *         - amount
 *         - narration
 *       properties:
 *         token:
 *           type: string
 *           description: API token provided by API provider
 *         requestid:
 *           type: string
 *           description: UUID v1 Unique request id
 *         name:
 *           type: string
 *           description: Name of user
 *         payerid:
 *           type: string
 *           description: User id
 *         msisdn:
 *           type: string
 *           description: MTN phone number
 *         amount:
 *           type: number
 *           description: Price of bundle
 *         narration:
 *           type: string
 *           description: Bundle description
 *       example:
 *         token: <API token>
 *         requestid: "143e5586-daad-11ed-afa1-0242ac120002"
 *         name: "John"
 *         payerid: "74"
 *         msisdn: "233546676098"
 *         amount: 20
 *         narration: 250 MB of data
 */

/**
 * @swagger
 * /extra-bundle-package:
 *   post:
 *     description: Sends extra bundle package to the given phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Extra Bundle Package'
 *     responses:
 *       500:
 *         description: Some server error occurred. (May include a message body indicating the cause of the error)
 *       401:
 *         description: Unauthorized. (Indicates that token is invalid)
 *       200:
 *         description: |
 *           **Sample Output**
 *           ```
 *           {
 *              "type": "itc",
 *              "responseCode": "03"
 *              "responseMessage": "Processing payment"
 *           }
 *           ```
 *
 *
 *           **The below table interprets the statusCode and statusMessage parameters this API may return**
 *
 *           | Status Code | Status Message                        | Description
 *           | ------------| ------------------------------------- | --------------------------------------------------------------------------------------------- |
 *           | 03          | Processing payment.                   | Initial success response when request is made indicating that the payment is being processed. |
 *           | 111         | Already processing payment.           | Indicates that a previously initiated payment is still processing. (It takes around 10 minues for a processing payment to timeout) <br />Wait for previous payment to timeout and try again later|
 *           | 110         | Duplicate Transaction                 | An existing refNo is being passed in the request|
 */
router.post("/", checkAuthMiddleware.checkAuth, async (req, res) => {
    try {
        req.body.network = "MTN";
        const validationResponse = validatePaymentRequest(req);

        if (validationResponse !== true) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }
        save(req, res).then(r => {});
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
});

module.exports = router;
