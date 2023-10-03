const {Op} = require("sequelize");
const models = require('../models');
const config = require('../config/config.json');
const axios = require('axios');

async function pay(req, res) {

    const payment = {
        client: req.body.client,
        refNo: req.body.requestid,
        name: req.body.name,
        payerid: req.body.payerid,
        msisdn: req.body.msisdn,
        network: req.body.network,
        amount: req.body.amount,
        narration: req.body.narration
    }
    let created_payment = await models.Payment.create(payment);

    let debit_resp = await axios.post('https://uniwallet.transflowitc.com/uniwallet/debit/customer', {
        refNo: req.body.requestid,
        msisdn: req.body.msisdn,
        amount: req.body.amount,
        narration: req.body.narration,
        network: req.body.network,
        merchantId: config.uniwallet.merchantId,
        productId: config.uniwallet.productId,
        apiKey: config.uniwallet.apiKey
    });
    console.log("debit_resp:", debit_resp.data);
    let update_obj = {};
    if ('responseCode' in debit_resp.data) {
        update_obj['responseCode'] = debit_resp.data.responseCode;
    }
    if ('responseMessage' in debit_resp.data) {
        update_obj['responseMessage'] = debit_resp.data.responseMessage;
    }
    if ('uniwalletTransactionId' in debit_resp.data) {
        update_obj['uniwalletTransactionId'] = debit_resp.data.uniwalletTransactionId;
    }

    await created_payment.update(update_obj, {where: {id: created_payment.id}})

    // 03	Processing payment.	Initial success response when request is made indicating that the payment is being processed.
    if (debit_resp.data.responseCode == '03') {
        res.status(200).json({
            responseCode: '03',
            responseMessage: 'Processing payment.'
        })
    }
        // 112	Service unavailable. Try again later	Requested service is currently unavailable
        // 131	Request timed out	A timeout occurred when sending request to the Mobile Network Operator (MNO)
        // 400	Invalid request	Request object is invalid.
        // 107	Invalid Credentials	API credentials are invalid
        // 121	Not allowed to access this service	The specified route has not been enabled for the product
    // Duplicate Transaction	An existing refNo is being passed in the request
    else {
        res.status(500).json({
            message: {
                responseCode: debit_resp.data.responseCode,
                responseMessage: debit_resp.data.responseMessage
            }
        })
    }
}

async function paymentStatusUpdate (resp_data) {
    console.log("status_response:", resp_data);
    let update_obj = {};
    if ('responseCode' in resp_data) {
        update_obj['responseCode'] = resp_data.responseCode;
    }
    if ('responseMessage' in resp_data) {
        update_obj['responseMessage'] = resp_data.responseMessage;
    }
    if ('balance' in resp_data) {
        update_obj['balance'] = resp_data.balance;
    }
    if ('uniwalletTransactionId' in resp_data) {
        update_obj['uniwalletTransactionId'] = resp_data.uniwalletTransactionId;
    }
    if ('networkTransactionId' in resp_data) {
        update_obj['networkTransactionId'] = resp_data.networkTransactionId;
    }
    if ('status' in resp_data) {
        update_obj['status'] = resp_data.status;
    }
    await models.Payment.update(update_obj, {where: {refNo: resp_data.refNo}});
}

async function save(req, res) {
    try {
        let payment_with_id = await models.Payment.findOne({
            where: {refNo: req.body.requestid}
        });

        let pending_payment = await models.Payment.findOne({
            where: {
                payerid: req.body.payerid,
                responseCode: '03'
            },
        });

        if (payment_with_id != null) {
            res.status(200).json({
                responseCode: '110',
                responseMessage: 'Duplicate Transaction'
            });
        }
        else if (pending_payment == null) {
            return await pay(req, res);
        } else {
            let status_resp = await axios.post(`https://uniwallet.transflowitc.com/uniwallet/check/transaction/status/${pending_payment.refNo}`, {
                merchantId: config.uniwallet.merchantId,
                productId: config.uniwallet.productId,
                apiKey: config.uniwallet.apiKey
            });
            await paymentStatusUpdate(status_resp.data);
            // 03	Processing payment.	Initial success response when request is made indicating that the payment is being processed.
            if (status_resp.data.responseCode == '03') {
                res.status(200).json({
                    responseCode: '111',
                    responseMessage: 'Already processing payment'
                })
            }
                // 01	Payment successful.	Callback response to indicate the finalised successful payment.
            // 100	Payment failed.	Processing of payment failed.
            else if (status_resp.data.responseCode == '01' || status_resp.data.responseCode == '100') {
                return await pay(req, res);
            }
                // 112	Service unavailable. Try again later	Requested service is currently unavailable
                // 131	Request timed out	A timeout occurred when sending request to the Mobile Network Operator (MNO)
                // 400	Invalid request	Request object is invalid.
                // 107	Invalid Credentials	API credentials are invalid
            // 121	Not allowed to access this service	The specified route has not been enabled for the product
            else {
                res.status(500).json({
                    message: {
                        responseCode: status_resp.data.responseCode,
                        responseMessage: status_resp.data.responseMessage
                    }
                })
            }
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

function show(req, res) {
    const id = req.params.id;

    models.Payment.findByPk(id).then(result => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: "Payment not found!"
            })
        }
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        })
    });
}


function index(req, res) {
    return res.status(405).json({
        message: "Get method not supported on this endpoint"
    });
}


function update(req, res) {
    return res.status(405).json({
        message: "Patch method not supported on this endpoint"
    });
}


function destroy(req, res) {
    return res.status(405).json({
        message: "Delete method not supported on this endpoint"
    });
}


module.exports = {
    save: save,
    show: show,
    index: index,
    update: update,
    destroy: destroy,
    paymentStatusUpdate: paymentStatusUpdate
}
