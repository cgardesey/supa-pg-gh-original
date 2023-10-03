const express = require('express');
const checkAuthMiddleware = require('../middleware/check-auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Sample Payment Callback:
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
 * /sample-payment-callback:
 *   post:
 *     description: Returns a sample callback request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sample Payment Callback'
 *     responses:
 *       200:
 *         description: |
 *           **Sample Output**
 *           ```
 *           {
 *              requestid: "143e5586-daad-11ed-afa1-0242ac120002",
 *              "type": "itc",
 *              "responseCode": "03"
 *              "responseMessage": "Processing payment"
 *           }
 *           ```
 *
 *
 *           **The below table interprets the statusCode and statusMessage parameters in the response body**
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
router.post("/", checkAuthMiddleware.checkAuth, (req, res) => {
    res.status(200).json({
        requestid: '44',
        type: 'itc',
        responseCode: '01',
        responseMessage: 'Successfully Processed Transaction|TEST'
    })
});

module.exports = router;
