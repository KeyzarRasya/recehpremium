const express = require("express");
const { jwtDecode } = require("jwt-decode");
const midtransClient = require("midtrans-client")
const {v4:uuid} = require("uuid")
require("dotenv").config()

const router = express.Router();

const snap = new midtransClient.Snap({
    isProduction:false,
    serverKey:process.env.SERVER_KEY
})

router.post("/topup", (req, res) => {
    const {gross} = req.body;
    const users = jwtDecode(req.signedCookies.token);
    console.log(users)
    const parameter = {
        "transaction_details":{
            "order_id":uuid(),
            "gross_amount":gross
        },
        "credit_card":{
            "secure":true
        },
        "customer_details":{
            "first_name":users.user.firstName,
            "last_name":users.user.lastName,
            "email":users.user.email
        }
    }
    snap.createTransaction(parameter)
    .then(trasanction => {
        res.redirect(trasanction.redirect_url)
    }).catch(err => console.log(err))
})

module.exports = router;