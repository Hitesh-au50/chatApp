const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const token = req.cookies.my_token;
    try{
        const user = jwt.verify(token, "mySecretKey")
        req.user = user;
        next()
    }
    catch(err){
        res.clearCookie('my_token')
        return res.redirect('/login')
    }
}

module.exports = verifyToken;