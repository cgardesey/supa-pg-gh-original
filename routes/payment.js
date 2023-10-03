const express = require('express');
const paymentsController = require('../controllers/payment.controller');
const checkAuthMiddleware = require('../middleware/check-auth');
const paymentMethodMiddleware = require('../middleware/payment-method');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - token
 *         - requestid
 *         - name
 *         - payerid
 *         - msisdn
 *         - network
 *         - narration
 *         - interval
 *         - category
 *       properties:
 *         token:
 *           type: string
 *           description: API token provided by API provider
 *         requestid:
 *           type: string
 *           description: UUID v1 Unique request id
 *         name:
 *           type: string
 *           description: Payer name
 *         payerid:
 *           type: string
 *           description: Payer id
 *         msisdn:
 *           type: string
 *           description: Phone number
 *         network:
 *           type: string
 *           description: Mobile network (Must be one of the options returned by the "available-networks" endpoint)
 *         amount:
 *           type: number
 *           description: Payment amount
 *         narration:
 *           type: string
 *           description: Payment description
 *         interval:
 *           type: number,
 *           description: Duration in seconds from latest payment with given msisdn
 *         provider_category:
 *           type: string
 *           description: Provider category type //Must be one of "driver", "merchant", ""
 *       example:
 *         token: <API token>
 *         requestid: "143e5586-daad-11ed-afa1-0242ac120002"
 *         name: John
 *         payerid: "36"
 *         msisdn: "233546676098"
 *         network: MTN
 *         amount: 10.00
 *         narration: Daily subscription pay
 *         interval: 604800
 *         provider_category: driver
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     description: Debit mobile money account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
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
router.post("/", checkAuthMiddleware.checkAuth, paymentMethodMiddleware.paymentMethod, paymentsController.save);
router.get("/", paymentsController.index);
router.get("/:id", paymentsController.show);
router.patch("/:id", checkAuthMiddleware.checkAuth, paymentsController.update);
router.delete("/:id", checkAuthMiddleware.checkAuth, paymentsController.destroy);

module.exports = router;
