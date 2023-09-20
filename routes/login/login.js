const User = require('../../models/User');

const express = require('express');
const router = express.Router();

const { formatBody } = require('../../middleware/format/body');



router.post('/', (req, res, next) => formatBody(req, res, next, ['email', 'password']), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user found.' });

    let correctPassword;
    try {
        correctPassword = await user.comparePasswords(req.body.password);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
    if (!correctPassword) return res.status(400).json({ success: false, message: 'Incorrect password.' });

    try {
        await user.login(req, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered login error. Please try again later.' });
    }

    res.redirect(`/app`);
});



module.exports = router;
