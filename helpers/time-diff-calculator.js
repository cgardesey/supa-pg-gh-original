const moment = require("moment");

const calculateDays = (paymentDate) => {
    return moment().diff(moment(paymentDate, 'YYYY-MM-DD HH:mm:ss'), 'days');
}

module.exports = {
    calculateDays: calculateDays
}