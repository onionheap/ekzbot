const io = require("socket.io-client")
const config = require("./config.json")

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = "onionheap/ekzbot"
const FILE_PATH = "logs/log.txt"

const socket = io("https://cytu.be")

let logQueue = []

async function salvarLogs() {
  if (logQueue.length === 0) return

  try {
    const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`

    const res = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "eskizitinha-bot"
      }
    })

    const data = await res.json()

    const content = Buffer.from(data.content, "base64").toString("utf8")

    const novosLogs = logQueue.join("\n")
    logQueue = []

    const novoConteudo = content + "\n" + novosLogs

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

    console.log("Logs enviados para GitHub")

  } catch (err) {
    console.log("Erro ao salvar logs:", err)
  }
}

setInterval(salvarLogs, 60000)

socket.on("connect", () => {
  console.log("Conectado ao Cytube")

  socket.emit("login", {
    name: config.username,
    pw: config.password
  })

  socket.emit("joinChannel", {
    name: config.channel
  })
})

socket.on("disconnect", () => {
  console.log("Desconectado do Cytube")
})

socket.on("chatMsg", (data) => {

  const username = data.username || "unknown"
  const msg = (data.msg || "").trim()

  console.log(username + ": " + msg)

  const log = `${new Date().toISOString()} | ${username}: ${msg}`
  logQueue.push(log)

  if (msg.startsWith("Eskizitinha") && msg.endsWith("?")) {

    const respostas = [
      "Sim.",
      "Não.",
      "Talvez.",
      "Provavelmente.",
      "Com certeza.",
      "Duvido muito.",
      "Pergunte novamente mais tarde."
    ]

    const resposta = respostas[Math.floor(Math.random() * respostas.length)]

    socket.emit("chatMsg", {
      msg: resposta,
      meta: {}
    })

  }

})
