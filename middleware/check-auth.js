const config = require('../config/config.json');

function checkAuth(req, res, next) {
    try {
        console.log(req.body.token)
        if (req.body.token === config.jugnoo.api_token) {
            req.body.client = 'jugnoo';
            next();
        }
        else if (req.body.token === config.yelo.api_token) {
            req.body.client = 'yelo';
            next();
        }
        else {
            return res.status(401).json({
                'message': "Invalid or expired token provided!",
                'error': e
            });
        }

    } catch (e) {
        return res.status(401).json({
            'message': "Invalid or expired token provided!",
            'error': e
        });
    }
}

module.exports = {
    checkAuth: checkAuth
}
