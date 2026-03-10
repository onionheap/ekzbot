const io = require("socket.io-client")
const fetch = require("node-fetch")
const config = require("./config.json")

// frases
const eightBallReplies = require("./frases/8ball.json")

// fofoca
const fofocas = require("./frases/fofoca.json")

// tarot
const tarot = require("./frases/tarot.json")

// comments
const comments = require("./frases/comments.json")

let commentsCooldown = 0

async function startBot() {

    console.log("Obtendo servidor do Cytube...")

    const res = await fetch(`${config.server}/socketconfig/${config.channel}.json`)
    const data = await res.json()

    const socketServer = data.servers[0].url

    console.log("Conectando em:", socketServer)

    const socket = io(socketServer, {
        transports: ["websocket"]
    })

    socket.on("connect", () => {
        console.log("Conectado ao servidor Cytube")

        socket.emit("joinChannel", {
            name: config.channel
        })

        socket.emit("login", {
            name: config.username,
            pw: config.password
        })
    })

    socket.on("login", (data) => {
        if (data.success) {
            console.log("Bot logado como", config.username)
        } else {
            console.log("Falha no login")
        }
    })

    socket.on("chatMsg", (msg) => {

if (!msg.msg) return

if (msg.username === config.username) return
    
    const text = msg.msg.trim()

    // 8BALL
if (
    text.toLowerCase().startsWith("eskizitinha") &&
    text.endsWith("?")
) {

    const resposta = eightBallReplies[Math.floor(Math.random() * eightBallReplies.length)]

    socket.emit("chatMsg", {
        msg: resposta
    })

}

    // COMMENTS
for (const key in comments) {

    const data = comments[key]

    for (const trigger of data.trigger) {

        if (text.includes(trigger)) {

            const now = Date.now()

            if (now < commentsCooldown) return

            commentsCooldown = now + 15000 // 15 segundos

            const resposta = data.reply[Math.floor(Math.random() * data.reply.length)]
                .replace("{user}", msg.username)

            socket.emit("chatMsg", {
                msg: resposta
            })

            return
        }

    }

}
    // tarot
    if (text.toLowerCase() === "eskizitinha, tarot!") {

    const resposta = tarot[Math.floor(Math.random() * tarot.length)]

    socket.emit("chatMsg", {
        msg: resposta
    })

}
    // fofoca
    if (text === "fale uma fofoca eskizitinha") {

    const fofoca = fofocas[Math.floor(Math.random() * fofocas.length)]

    socket.emit("chatMsg", {
        msg: fofoca
    })

}

})

}

startBot()
