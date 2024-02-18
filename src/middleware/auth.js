const isLogin = (req, res, next) => {
    if(req.signedCookies.token !== undefined){
        return next()
    }
    res.redirect("/login")
}

const isSigned = (req, res, next) => {
    if(req.signedCookies.token !== undefined){
        return res.redirect("/service")
    }
    next()
}

module.exports = [isLogin, isSigned];