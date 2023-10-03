const express = require('express');
const checkAuthMiddleware = require('../middleware/check-auth');
const paymentStatusUpdate = require('../controllers/payment.controller').paymentStatusUpdate;
const config = require('../config/config.json');
const axios = require('axios');
const models = require('../models');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment Status:
 *       type: object
 *       required:
 *         - token
 *         - requestid
 *         - type
 *       properties:
 *         token:
 *           type: string
 *           description: API token provided by API provider
 *         requestid:
 *           type: string
 *           description: Unique request id previously sent in payment request
 *         type:
 *           type: string
 *           description: Payment type. (Must be one of "itc" or "mtn")
 *       example:
 *         token: <API token>
 *         requestid: "143e5586-daad-11ed-afa1-0242ac120002"
 *         type: itc
 */

/**
 * @swagger
 * /payment-status:
 *   post:
 *     description: Check payment status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment Status'
 *     responses:
 *       500:
 *         description: Some server error occurred. (May include a message body indicating the cause of the error)
 *       401:
 *         description: Unauthorized. (Indicates that token is invalid)
 *       400:
 *         description: Bad request. (Indicates that some required fields were not provided or request id is invalid)
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
 *           | 01          | Payment successful.                   | Callback response to indicate the finalised successful payment.                               |
 *           | 100         | Payment failed.                       | Processing of payment failed.                                                                 |
 *           | 112         | Service unavailable. Try again later  | Initial success response when request is made indicating that the payment is being processed. |
 *           | 131         | Request timed out                     | A timeout occurred when sending request to the Mobile Network Operator (MNO)                   |
 *           <br />
 *           <br />
 *           <br />
 *           <br />
 *           **MTN Specific Status Responses**
 *
 *           | Status Code | Status Message                                 | Description
 *           | ------------| -----------------------------------------------| --------------------------------------------------------------------------------------------- |
 *           | 529         | TARGET AUTHORIZATION ERROR                     | Transaction will cause wallet limit rule to be violated <br />(ie. The customer does not have enough funds to complete the transaction OR The transaction will cause the wallet to exceed the maximum amount it can hold and hence can't be completed) |
 *           | 527         | RESOURCE NOT FOUND                             | Number is not registered on MTN mobile money                                                  |
 *           | 515         | ACCOUNTHOLDER WITH FRI NOT FOUND               | The MTN msisdn provided is not a registered subscriber                                        |
 *           | 682         | An internal error caused the operation to fail | An internal error caused the operation to fail                                                |
 *           | 04          | Payment Amount is not in range.                | The Payment Amount specified exceeds the allowed maximum amount                               |
 *           | 779         | The required resource is temporarily locked    | Some other transactional operation is being performed on the wallet therefore this transaction can not be completed at this time|
 *           <br />
 *           <br />
 *           <br />
 *           <br />
 *           **Vodafone Specific Status Responses**
 *
 *           | Status Code | Status Message                                  | Description
 *           | ----------- | ------------------------------------------------|-------------------------------------------------------------------------|
 *           | 529         | The balance is insufficient for the transaction.| The customer does not have sufficient funds to complete the transaction |
 *           | 2058        | Voucher Invalid                                 | The vodafone voucher provided is invalid or has expired                 |
 *           | 1001        | The Caller Information is invalid               | The vodafone msisdn specified is not correct                            |
 *           <br />
 *           <br />
 *           <br />
 *           <br />
 *           **AirtelTigo Specific Status Responses**
 *
 *           | Status Code | Status Message                                                                                                                   | Description
 *           | ----------- | ---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
 *           | 60019       | Dear Customer, you have insufficient funds. <br />5 successive invalid transfers will lock your wallet. <br />Call 100 to locate an agent. | Customer has insufficient funds|
 *           | 00042       | Requested amount not in multiple of allowed value                                                                                | The amount specified in the request is not allowed|
 *           | 00068       | Dear Customer, the PIN you have entered is incorrect. <br />5 successive wrong entries will lock your wallet. <br />Please call 100 for help.| Incorrect PIN                                     |
 *           | 00017       | Invalid Pin length                                                                                                               | Invalid Pin length                                |
 *           | 00210       | Dear Customer, your wallet is locked due to 5 successive invalid PIN entry.<br /> Please call 100 for help.                      | Customer wallet is locked                         |
 */
router.post("/", checkAuthMiddleware.checkAuth, async (req, res) => {
    try {
        if (req.body.type == null) {
            return res.status(400).json({
                "message": "Validation failed",
                "errors": [
                    {
                        "type": "required",
                        "message": "The 'type' field is required.",
                        "field": "type"
                    }
                ]
            });
        }
        if (req.body.requestid == null) {
            return res.status(400).json({
                "message": "Validation failed",
                "errors": [
                    {
                        "type": "required",
                        "message": "The 'requestid' field is required.",
                        "field": "requestid"
                    }
                ]
            });
        }
        if (req.body.type == 'itc') {
            let payment = await models.Payment.findOne({
                where: {
                    refNo: req.body.requestid,
                    client: req.body.client
                }
            });
            if (payment == null) {
                res.status(400).json({
                    message: "Invalid request id"
                })
            } else {
                let status_resp = await axios.post(`https://uniwallet.transflowitc.com/uniwallet/check/transaction/status/${payment.refNo}`, {
                    merchantId: config.uniwallet.merchantId,
                    productId: config.uniwallet.productId,
                    apiKey: config.uniwallet.apiKey
                });
                await paymentStatusUpdate(status_resp.data);
                // 112	Service unavailable. Try again later	Requested service is currently unavailable
                // 131	Request timed out	A timeout occurred when sending request to the Mobile Network Operator (MNO)
                // 400	Invalid request	Request object is invalid.
                // 107	Invalid Credentials	API credentials are invalid
                // 121	Not allowed to access this service	The specified route has not been enabled for the product
                if (
                    status_resp.data.responseCode == '112' ||
                    status_resp.data.responseCode == '131' ||
                    status_resp.data.responseCode == '400' ||
                    status_resp.data.responseCode == '107' ||
                    status_resp.data.responseCode == '121'
                ) {
                    res.status(500).json({
                        message: {
                            responseCode: status_resp.data.responseCode,
                            responseMessage: status_resp.data.responseMessage
                        }
                    })
                }
                // 03	Processing payment.	Initial success response when request is made indicating that the payment is being processed.
                // 01	Payment successful.	Callback response to indicate the finalised successful payment.
                // 100	Payment failed.	Processing of payment failed.
                // Network specific error codes
                else {
                    res.status(200).json({
                        type: 'itc',
                        responseCode: status_resp.data.responseCode,
                        responseMessage: status_resp.data.responseMessage
                    })
                }
            }
        } else {

        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
});

module.exports = router;
