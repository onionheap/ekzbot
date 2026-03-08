const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = "onionheap/ekzbot"
const FILE_PATH = "logs/log.txt"

const io = require("socket.io-client")
const config = require("./config.json")

async function salvarLog(texto) {
  try {

    const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`

    // pegar arquivo atual
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "eskizitinha-bot"
      }
    })

    const data = await res.json()

    const content = Buffer.from(data.content, "base64").toString("utf8")

    const novoConteudo = content + "\n" + texto

    const encoded = Buffer.from(novoConteudo).toString("base64")

    await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "update log",
        content: encoded,
        sha: data.sha
      })
    })

  } catch (err) {
    console.log("Erro ao salvar log:", err)
  }
}

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

    socket.on("chatMsg", (data) => {

  const username = data.username || "unknown"
  const msg = (data.msg || "").trim()

  console.log(username + ": " + msg)

  try {
    salvarLog(username + ": " + msg)
  } catch (err) {
    console.log("Erro ao salvar log:", err)
  }

  if (msg.startsWith("Eskizitinha") && msg.endsWith("?")) {
      
    const respostas = [
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
    ]

    const resposta = respostas[Math.floor(Math.random() * respostas.length)]

    socket.emit("chatMsg", {
      msg: resposta,
      meta: {}
    })

  }

})

}

startBot()
