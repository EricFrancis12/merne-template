const User = require('../../models/User');

const { isEmpty } = require('../../utils/utils');



async function validate(req) {
    const session_id = User.getSession_id(req)

    if (isEmpty(session_id)) return null;

    let user;
    try {
        user = await User.findOne({ 'session._id': session_id });
    } catch (err) {
        console.error(err);
        return null;
    }

    req.session_id = session_id;
    return user;
}



async function auth(req, res, next) {
    const user = await validate(req);

    if (!user) {
        res.status(401).render('unauthorized', { message: '' });
        return null;
    }

    req.user = user;
    next();
}



module.exports = auth;
