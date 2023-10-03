const express = require('express');
const bodyParser = require('body-parser');
const paymentRoute = require('./routes/payment');
const paymentCallbackRoute = require('./routes/payment.callback');
const mtnPaymentCallbackRoute = require('./routes/mtn-payment.callback');
const samplePaymentCallbackRoute = require('./routes/sample-payment-callback');
const availableNetworksRoute = require('./routes/available-networks');
const paymentStatusRoute = require('./routes/payment-status');
const welcomeBundlePackageRoute = require('./routes/welcome-bundle-package');
const extraBundlePackageRoute = require('./routes/extra-bundle-package');
const config = require('./config/config.json');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Payment API",
            version: "1.0.0",
            description: "Payment API For Supa Service",
        },
        servers: [
            {
                // url: `http://localhost:3000`,
                url: `http://41.189.178.40:55559`
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const uiOptions = {
    customCss: `
    .topbar-wrapper img {
    content:url('https://getsupa.net/images/logo.png');
    }
    // .swagger-ui .topbar { display: none }
    `,
    customSiteTitle: "Supa Payment Gateway GH",
    customfavIcon: "./assets/logo.ico"
};

const specs = swaggerJsDoc(options);

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs, uiOptions));

app.use(bodyParser.json());

app.use("/payments", paymentRoute);
app.use("/payments/callback", paymentCallbackRoute);
app.use("/mtn-payments/callback", mtnPaymentCallbackRoute);
app.use("/sample-payment-callback", samplePaymentCallbackRoute);
app.use("/available-networks", availableNetworksRoute);
app.use("/payment-status", paymentStatusRoute);
app.use("/welcome-bundle-package", welcomeBundlePackageRoute);
app.use("/extra-bundle-package", extraBundlePackageRoute);


module.exports = app;
