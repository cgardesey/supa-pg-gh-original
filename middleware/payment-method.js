const models = require('../models');
const {Op} = require("sequelize");
const mtnPay = require('../helpers/mtn-pay').mtnPay;
const Validator = require('fastest-validator');


function validatePaymentRequest(req) {
    const payment = {
        refNo: req.body.requestid,
        name: req.body.name,
        payerid: req.body.payerid,
        msisdn: req.body.msisdn,
        network: req.body.network,
        amount: req.body.amount,
        narration: req.body.narration
    }
    const schema = {
        refNo: {type: "string", optional: false},
        name: {type: "string", optional: false, max: "100"},
        payerid: {type: "string", optional: false},
        msisdn: {type: "string", optional: false, max: "12"},
        network: {type: "string", optional: false, isIn: [['MTN', 'VODAFONE', 'ARTLTIGO']]},
        amount: {type: "number", optional: false, min: 0.01},
        narration: {type: "string", optional: false, max: "100"}
    }
    const v = new Validator();
    const validationResponse = v.validate(payment, schema);
    return validationResponse;
}

async function paymentMethod(req, res, next) {

    if (req.body.interval == null) {
        return res.status(400).json({
            "message": "Validation failed",
            "errors": [
                {
                    "type": "required",
                    "message": "The 'interval' field is required.",
                    "field": "interval"
                }
            ]
        });
    }
    if (req.body.provider_category == null) {
        return res.status(400).json({
            "message": "Validation failed",
            "errors": [
                {
                    "type": "required",
                    "message": "The 'provider_category' field is required.",
                    "field": "provider_category"
                }
            ]
        });
    }

    const validationResponse = validatePaymentRequest(req);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    if (req.body.network == 'MTN') {
        // req.body.interval -> Duration in seconds from latest payment with given msisdn
        if (false) {
        // if (req.body.interval > 604800) {
            mtnPay(req, res).then(r => {});
        } else {
            next();
        }
    }
    else {
        next();
    }
}

module.exports = {
    paymentMethod: paymentMethod,
    validatePaymentRequest: validatePaymentRequest
}