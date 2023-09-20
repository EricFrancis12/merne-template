const User = require('../../models/User');

const express = require('express');
const router = express.Router();

const { formatBody } = require('../../middleware/format/body');



router.post('/', (req, res, next) => formatBody(req, res, next, ['email']), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user found.' });

    try {
        user.resetPassword();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered error resetting password. Please try again later.' });
    }

    res.status(200).render('message', {
        title: 'Check Your Email',
        message: `We are sending you password reset instructions via email now. Please click on the link in the email to reset your password.`
    });
});



router.get('/auth/:resetPasswordAuthStr', async (req, res) => {
    let user = await User.findOne({ resetPasswordAuthStr: req.params.resetPasswordAuthStr })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(400).render('message', {
        title: 'Invalid password reset link...'
    });

    res.status(200).render('enter-new-password', {
        email: user.email
    });
});



router.post('/enter-new-password', (req, res, next) => formatBody(req, res, next, ['password', 'confPassword']), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user exists' });

    if (req.body.password !== req.body.confPassword || req.body.password === '') return res.status(400).json({ success: false, message: 'Erorr. Passwords do not match.' });
    const hashedPassword = await User.hashPassword(req.body.password);

    try {
        await user.setNewPassword(hashedPassword);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered error setting new password. Please try again later.' });
    }

    res.status(201).render('message', {
        title: 'Your password has been reset',
        message: '<a href="/login">Click Here to Login</a>'
    });
});



module.exports = router;