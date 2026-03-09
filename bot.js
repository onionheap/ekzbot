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
"Sim. Mas não conta com competência envolvida.",
"Não. Mas você vai tentar mesmo assim.",
"Talvez. Depende do nível de álcool no sistema.",
"Sim, mas só se ninguém descobrir.",
"Não. Nem com tutorial do YouTube.",
"Provavelmente… mas vai dar trabalho.",
"Sim, mas prepare-se para consequências emocionais.",
"Não. Nem o universo aguenta essa ideia.",
"Talvez. Já vi decisões piores.",
"Sim. Mas não diga que eu incentivei.",
"Não. Mas a tentativa vai render história.",
"Talvez… pergunta de novo depois de mais duas cervejas.",
"Sim, mas vai terminar em vergonha pública.",
"Não. Nem o ChatGPT salvaria essa.",
"Talvez. Estatisticamente alguém tem que conseguir.",
"Sim… mas não espere dignidade no processo.",
"Não. Mas se fizer mesmo assim eu respeito.",
"Talvez. Já deu certo com gente mais burra.",
"Sim, mas a probabilidade é ofensiva.",
"Não. Mas continue acreditando."
    
];
