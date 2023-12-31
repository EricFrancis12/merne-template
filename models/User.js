const crypto = require('crypto');

const brevo = require('sib-api-v3-sdk');
brevo.ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const bcrypt = require('bcrypt');
const hash = 10;

const mongoose = require('mongoose');

const { rootUrl } = require('../utils/utils');



const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    emailAuthStr: String,
    resetPasswordAuthStr: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    dateLastUpdated: {
        type: Date,
        default: () => Date.now()
    },
    session: {
        _id: {
            type: String,
            default: ''
        },
        IP: {
            type: String,
            default: ''
        },
        UA: {
            type: String,
            default: ''
        }
    }
});

UserSchema.pre('save', function (next) {
    this.dateLastUpdated = Date.now();
    next();
});



UserSchema.methods.register = async function () {
    const emailAuthStr = crypto.randomUUID();
    const emailAuthLink = `${rootUrl}/register/auth/${emailAuthStr}`;

    this.emailAuthStr = emailAuthStr;

    try {
        await this.save();
    } catch (err) {
        throw new Error('Encountered error saving user');
    }

    try {
        new brevo.TransactionalEmailsApi().sendTransacEmail({
            'subject': `${process.env.APP_NAME} - Confirm Your Email Address`,
            'sender': { 'email': 'api@sendinblue.com', 'name': process.env.APP_NAME || 'Support' },
            'replyTo': { 'email': 'api@sendinblue.com', 'name': process.env.APP_NAME || 'Support' },
            'to': [{ 'name': this.email, 'email': this.email }],
            'htmlContent': `<html><body><p>Please click the following link to activate your account: <a href="${emailAuthLink}">${emailAuthLink}</a></p></body></html>`
        });
    } catch (err) {
        throw new Error('Encountered error sending email to user');
    }
}

UserSchema.methods.login = async function (req, res) {
    if (!req || !res) throw new Error('Invalid argument');

    const session_id = crypto.randomUUID();

    this.session._id = session_id;
    this.session.IP = req.ip;
    this.session.UA = req.headers['user-agent'];

    try {
        await this.save();
    } catch (err) {
        throw new Error('Unable to save user to DB');
    }

    res.cookie('session_id', session_id, {
        httpOnly: true,
        signed: true
    });

    return session_id;
}

UserSchema.methods.activateAccount = async function () {
    this.emailVerified = true;
    this.emailAuthStr = '';

    try {
        await this.save();
    } catch (err) {
        throw new Error(err);
    }
}

UserSchema.methods.resetPassword = async function () {
    const resetPasswordAuthStr = crypto.randomUUID();
    const resetPasswordAuthLink = `${rootUrl}/reset-password/auth/${resetPasswordAuthStr}`;

    this.resetPasswordAuthStr = resetPasswordAuthStr;

    try {
        await this.save();
    } catch (err) {
        console.error('error occurred: ', err);
        return res.status(500).json({ success: false, message: 'Encountered error generating reset link. Please try again later.' });
    }

    try {
        new brevo.TransactionalEmailsApi().sendTransacEmail({
            'subject': `${process.env.APP_NAME} - Password Reset`,
            'sender': { 'email': 'api@sendinblue.com', 'name': process.env.APP_NAME || 'Support' },
            'replyTo': { 'email': 'api@sendinblue.com', 'name': process.env.APP_NAME || 'Support' },
            'to': [{ 'name': this.email, 'email': this.email }],
            'htmlContent': `<html><body><p>A password reset was initialized for your account. If you recognize this attempt, please click here to reset your password: <a href="${resetPasswordAuthLink}">${resetPasswordAuthLink}</a></p></body></html>`
        });
    } catch (err) {
        throw new Error('Encountered error sending email to user');
    }
}

UserSchema.methods.setNewPassword = async function (hashedPassword) {
    if (!hashedPassword) throw new Error('Invalid argument.');

    this.hashedPassword = hashedPassword;
    this.resetPasswordAuthStr = '';

    try {
        await this.save();
    } catch (err) {
        throw new Error('Encountered error setting new password.');
    }
}

UserSchema.methods.comparePasswords = async function (password) {
    return await bcrypt.compare(password, this.hashedPassword);
}

UserSchema.methods.logout = async function () {
    this.session._id = '';
    this.session.IP = '';
    this.session.UA = '';

    try {
        await this.save();
    } catch (err) {
        throw new Error('Error logging user out.');
    }
}

const User = mongoose.model('User', UserSchema);

User.getSession_id = function (req) {
    return req.signedCookies?.session_id
        ? req.signedCookies.session_id
        : (req.header('Authorization') || '').split(' ').pop();
}

User.hashPassword = async function (password) {
    return await bcrypt.hash(password, hash);
}



module.exports = User;
