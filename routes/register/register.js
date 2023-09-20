const User = require('../../models/User');

const express = require('express');
const router = express.Router();

const { formatBody } = require('../../middleware/format/body');



router.post('/', (req, res, next) => formatBody(req, res, next, ['email', 'password']), formatBody, async (req, res) => {
    let existingUser = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            existingUser = null;
        });
    if (existingUser) return res.status(401).json({ success: false, message: 'This email already exists.' });

    const hashedPassword = await User.hashPassword(req.body.password);
    const user = new User({
        email: req.body.email,
        hashedPassword
    });

    try {
        await user.register(req, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered registration error. Please try again later.' });
    }

    res.status(200).render('message', {
        title: 'Confirm your email',
        heading: 'Please confirm your email address',
        message: `We are sending you an activation email now. Please click on the link in the email to activate your account.
        <div>Didn't receive the email? <a href="/register/resend">Click Here to resend it</a><div>`
    });
});



router.get('/auth/:emailAuthStr', async (req, res) => {
    let user = await User.findOne({ emailAuthStr: req.params.emailAuthStr })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(201).render('message', { title: 'Invalid email authorization link.' });

    try {
        await user.activateAccount();
    } catch (err) {
        console.error(err);
        return res.status(201).render('message', { title: 'Encountered error processing authentication. Please try again later.' });
    }

    res.status(201).render('message', {
        title: 'Your Account is now Activated',
        message: '<a href="/login">Click Here to Login</a>'
    });
});



router.post('/resend', (req, res, next) => formatBody(req, res, next, ['email']), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user found.' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Your account is already activated.' });

    try {
        await user.register();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered registration error. Please try again later.' });
    }

    res.status(201).render('message', {
        title: 'Please check your email',
        message: `We are sending you the activation email now. Please click on the link in the email to activate your account.`
    });
});



module.exports = router;
