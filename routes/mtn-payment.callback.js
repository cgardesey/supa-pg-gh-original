const express = require('express');

const router = express.Router();

router.post("/", (req, res) => {
    res.status(204).json()
});

module.exports = router;
