const express = require('express');
const axios = require('axios');
const paymentStatusUpdate = require('../controllers/payment.controller').paymentStatusUpdate;
const config = require('../config/config.json');
const {Op} = require("sequelize");
const models = require('../models');

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        console.log("callback:", req.body);
        await paymentStatusUpdate(req.body);

        let payment = await models.Payment.findOne({
            where: {
                refNo: req.body.refNo
            },
        });
        let client_webhook = '';
        if (payment.client == 'jugnoo') {
            client_webhook = config.jugnoo.payment_callback_url;
        } else {
            client_webhook = config.yelo.payment_callback_url;
        }
        await axios.post(client_webhook, {
            requestid: req.body.refNo,
            type: 'itc',
            responseCode: req.body.responseCode,
            responseMessage: req.body.responseMessage
        });
    } catch (e) {
        console.log("Callback Error:", e);
    }
});

module.exports = router;
