let webSocket = null
let isConnected = false
let lastSendInstant = 0
let pendingMessages = []

let _url = null
let _bundle = null

function doConnect() {
  webSocket = new WebSocket(_url)

  webSocket.onopen = (event) => {
    isConnected = true
    for(const message of pendingMessages)
      webSocket.send(message)
  }
  webSocket.onclose = (event) => {
    isConnected = false

    if(Date.now() - lastSendInstant < 1000*60*5)
      doConnect()
  }
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = (event) => {
    console.err('Socket Error: ' + JSON.stringify(event))
  }
}

function send(text) {
  const parcel = {
    'type': 'trace',
    'payload': {
      level: 'd',
      bundle: _bundle,
      instant: Date.now(),
      text: text,
    }
  }
  const message = JSON.stringify(parcel)

  if(isConnected) {
    webSocket.send(message)
  }
  else {
    pendingMessages.push(message)
    doConnect()
  }
  lastSendInstant = Date.now()
}

export function register(url, bundle) {
  _url = url
  _bundle = bundle
  doConnect()
}

export function log(message, logLevel) {
  send(message)
}

export function logv(message) {
  send(message)
}


export default {
  register, logv
}
