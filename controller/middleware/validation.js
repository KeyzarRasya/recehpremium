const wrongPasswordHandler = (req, res, next) => {
    if(req.session.user === null){
            res.redirect("/login/301")
    }
    next()
}

module.exports = [wrongPasswordHandler]