const io = require("socket.io-client")
const fetch = require("node-fetch")
const config = {
    server: process.env.CYTUBE_SERVER,
    channel: process.env.CYTUBE_CHANNEL,
    username: process.env.CYTUBE_USERNAME,
    password: process.env.CYTUBE_PASSWORD,
    discordWebhook: process.env.DISCORD_WEBHOOK
    }

let botStartTime = Date.now()

// frases
const eightBallReplies = require("./frases/8ball.json")

// fofoca
const fofocas = require("./frases/fofoca.json")

// tarot
const tarot = require("./frases/tarot.json")

// comments
const comments = require("./frases/comments.json")

let commentsCooldown = 5000

// cooldown por usuário (24h)
const userDailyCooldown = {}

const DAY = 24 * 60 * 60 * 1000

async function sendDiscordLog(message){
if(!config.discordWebhook)return
if(message===lastLog)return
lastLog=message
try{
await fetch(config.discordWebhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:message})})
}catch(err){console.log("Erro ao enviar log para Discord:",err)}
}

let lastLog=""
let userCooldown={}
let lastVideo=""

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

if (msg.time && msg.time < botStartTime) return
        
if (!msg.msg) return

if (msg.username === config.username) return

if (msg.username === "[server]") return
    
    const text = msg.msg.trim()

    sendDiscordLog(`💬 **${msg.username}:** ${msg.msg}`)

        // MORRER HOJE
if (text === "qual a chance de morrer hoje?") {

    const key = msg.username + "_morte"
    const now = Date.now()

    if (userDailyCooldown[msg.username] && now - userDailyCooldown[msg.username] < DAY) {
        socket.emit("chatMsg", {
            msg: `${msg.username}, o destino já foi consultado hoje.`
        })
        return
    }

    userDailyCooldown[msg.username] = now

    const chance = Math.floor(Math.random() * 101)

    socket.emit("chatMsg", {
        msg: `${msg.username}, sua chance de morrer hoje é ${chance}%`
    })

}

        // ATRAENTE HOJE
if (text === "Qual a minha gostosura hoje?") {

    const key = msg.username + "_goatosura"
    const now = Date.now()

    if (userDailyCooldown[msg.username] && now - userDailyCooldown[msg.username] < DAY) {
        socket.emit("chatMsg", {
            msg: `${msg.username}, calma lá, é só uma vez por dia.`
        })
        return
    }

    userDailyCooldown[msg.username] = now

    const porcentagem = Math.floor(Math.random() * 101)

    socket.emit("chatMsg", {
        msg: `${msg.username}, hoje você está ${porcentagem}% gostoso.`
    })

}
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

        const regex = new RegExp(`\\b${trigger}\\b`, "i")
if (regex.test(text)) {

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

        socket.on("addUser",(user)=>{if(!user||!user.name)return;let now=Date.now();if(userCooldown[user.name]&&now-userCooldown[user.name]<3000)return;userCooldown[user.name]=now;sendDiscordLog(`🟢 **${user.name} entrou no canal**`)})

socket.on("userLeave",(user)=>{if(!user||!user.name)return;let now=Date.now();if(userCooldown[user.name]&&now-userCooldown[user.name]<3000)return;userCooldown[user.name]=now;sendDiscordLog(`🔴 **${user.name} saiu do canal**`)})

socket.on("clearchat",()=>{sendDiscordLog(`🧹 **O chat foi limpo por um moderador**`)})

socket.on("changeMedia",(media)=>{if(!media)return;if(media.title===lastVideo)return;lastVideo=media.title;let link="";if(media.type==="yt")link=`https://youtu.be/${media.id}`;sendDiscordLog(`🎬 **Novo vídeo:** ${media.title}\n${link}`)})

        })
}

startBot()
        
