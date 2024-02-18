require("dotenv").config()
const express = require("express");
const { default: OpenAI } = require("openai");
const router = express.Router();
const User = require("../model/User")
const fs = require("fs")
const path = require("path")
const [isLogin] = require("../src/middleware/auth")
const [separate] = require("../src/helper/helper")
const axios = require("axios");
const { jwtDecode } = require("jwt-decode");

const checkVoice = (req, res, next) => {
    const {voice} = req.body
    console.log(voice)
    next()
}

const openai = new OpenAI({
    apiKey:process.env.API_KEY
})

router.get("/text-to-speech", isLogin, (req, res) => {
    const {token} = req.signedCookies;
    const jwtdcd = jwtDecode(token)
    res.render("tts", ({user:jwtdcd.user}))
})

router.post("/text-to-speech",checkVoice, async (req, res) => {
    const {text, voice} = req.body;
    

    const speechFile = path.resolve("./speech.mp3")

    const mp3 = await openai.audio.speech.create({
        model:"tts-1",
        voice:voice,
        input: text,
    })
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader("Content-Disposition", "attachment; filename=speech.mp3");
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
})

router.get("/image-gen", isLogin, (req, res) => {
    const {token} = req.signedCookies;
    const jwtdcd = jwtDecode(token)
    res.render("imageGen", {user:jwtdcd.user})
})

router.post("/image-gen", async(req, res) => {
    const {prompts, allToken, resolution} = req.body;
    console.log(prompts, separate(allToken), resolution)
    const response = await openai.images.generate({
        model:"dall-e-2",
        prompt:prompts,
        n:1,
        size:resolution,
    })
    const imageUrl = response.data[0].url;
    const fileName = "generated_image.png"; 

    const fileResponse = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
    });

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'image/png');

    fileResponse.data.pipe(res);
})

module.exports = router;