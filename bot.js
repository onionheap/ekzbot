const io = require("socket.io-client")
const fetch = require("node-fetch")
const config = require("./config.json")

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

    const text = msg.msg.trim()

    if (
        text.toLowerCase().startsWith("eskizitinha") &&
        text.endsWith("?")
    ) {

        const resposta = eightBallReplies[Math.floor(Math.random() * eightBallReplies.length)]

        socket.emit("chatMsg", {
            msg: `🎱 ${resposta}`
        })

    }

})

startBot()

const eightBallReplies = [
"Sim.",
"Não.",
"Talvez.",
"Provavelmente.",
"As chances são boas.",
"Não conte com isso.",
"Definitivamente sim.",
"Definitivamente não.",
"Pergunte novamente mais tarde.",
"Meu palpite é sim.",
"Meu palpite é não.",
"Isso é um mistério.",
"Os sinais apontam que sim.",
"Hoje não."
];
