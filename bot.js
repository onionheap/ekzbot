const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = "onionheap/ekzbot"
const FILE_PATH = "logs/log.txt"

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

    const username = data.username
  const msg = data.msg.trim()

  console.log(username + ": " + msg)

  salvarLog(username + ": " + msg)

    if (
        text.toLowerCase().startsWith("eskizitinha") &&
        text.endsWith("?")
    ) {

        const resposta = eightBallReplies[Math.floor(Math.random() * eightBallReplies.length)]

        socket.emit("chatMsg", {
            msg: `${resposta}`
        })

    }

})

}

startBot()

const eightBallReplies = [
"Sim.",
"Não.",
"Talvez.",
"Provavelmente.",
"Tipo, as chances são boas mas quem sabe.",
"Não conta com isso não.",
"Definitivamente sim.",
"Definitivamente não.",
"Você não vai querer uma resposta para isso.",
"Eu acho que sim mas o universo que sabe.",
"Huum o universo está dizendo que não.",
"Isso é um mistério.",
"As ondas da rádio apontam que é bem provável",
"Hoje não."
];
