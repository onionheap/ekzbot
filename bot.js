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

    // TAROT
    if (text.toLowerCase() === "eskizitinha, tarot!") {

        const tarot = [

            "🔮 A carta revela: más decisões estão no seu futuro.",
            "🔮 O destino diz: hoje não é um bom dia para mandar mensagem para ex.",
            "🔮 As cartas mostram: você vai tomar uma decisão ruim e defender ela com confiança.",
            "🔮 O universo aconselha: evite tequila e decisões importantes hoje.",
            "🔮 A previsão é clara: vergonha pública moderada.",
            "🔮 As cartas indicam: amanhã você vai fingir que não lembra disso.",
            "🔮 O destino aponta: conversa que parecia ótima às 2h da manhã.",
            "🔮 O universo prevê: zero sabedoria, mas boas histórias.",
            "🔮 As cartas indicam: alguém vai dizer 'olha isso' e causar caos.",
            "🔮 O futuro mostra: decisões questionáveis à frente."

        ]

        const resposta = tarot[Math.floor(Math.random() * tarot.length)]

        socket.emit("chatMsg", {
            msg: resposta
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
"Não. Mas continue acreditando.",
"O Maru deve responder isso."
];
