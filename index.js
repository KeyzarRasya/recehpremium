require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const User = require("./model/User")
const session = require("express-session")
const cookie = require("cookie-parser")
const bodyParser = require("body-parser")
const chatgpt = require("./controller/chatgptController")
const payment = require("./controller/midtransController")
const [isLogin, isSigned] = require("./src/middleware/auth")
const [wrongPasswordHandler] = require("./controller/middleware/validation")
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken')
const path = require("path")
const { jwtDecode } = require('jwt-decode')
const CryptoJS = require("crypto-js")


mongoose.connect(process.env.MONGO_URI)
.then(res => console.log("Success"))
.catch(err => console.log(err))

const app = new express();

app.use(session({
    secret:"cheap",
    resave:false,
    saveUninitialized:false
}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("views"))
app.use(express.static("image"))
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use("/chatgpt", chatgpt)
app.use("/transaction", payment);

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'));

app.get("/",isLogin, (req, res) => {
    res.render("service")
})

app.get("/service", isLogin,(req, res)=> {
    const {token} = req.signedCookies;
    const jwtdcd = jwtDecode(token)
    res.render("service", {user:jwtdcd.user})
})

app.get("/login/:status", (req, res) => {
    const {status} = req.params;
    console.log(status)
    let message = ""
    if(parseInt(status) === 301){
        message = "Wrong email and password"
    }
    res.render("login", {message:message})
})

app.get("/login", isSigned, (req, res) => {
    res.render("login", {message:''})
})

app.get("/topup", isLogin, (req, res) => {
    res.render("topup")
})

app.post("/login", (req, res) => {
    const {email, password} = req.body;
    User.findOne({email, password})
    .then(user => {
        if(user === null){
            res.redirect("/login/301")
        }else{
            const token = jwt.sign({user}, process.env.JWT_SECRET, {expiresIn:"1h"})
            res.cookie('token', token, {signed: true, expires:new Date(Date.now() + 3 * 3600000), httpOnly:true})
            res.redirect("/service")
        }
    }).catch(err => {
        console.log(err);
    })
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", (req, res) => {
    const {firstName, lastName, email, password} = req.body;
    User.create({firstName, lastName, email, password})
    .then(respon => {
        res.redirect("/login")
    }).catch(error => {
        console.log(error)
    })
})

app.get("/info", (req, res) => {
    res.send(req.session.user)
})

app.get("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/")
})

app.listen(process.env.PORT || 3001, () => {
    console.log(`Run at Port : ${process.env.PORT}`)
})