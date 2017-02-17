'use strict'

let webSocket = null
let isConnected = false
let isConnecting = false
let lastSendInstant = 0
let pendingMessages = []

let _url = null
let _bundle = null

function doConnect() {
  isConnecting = true
  webSocket = new WebSocket(_url)

  webSocket.onopen = (event) => {
    isConnecting = false
    isConnected = true
    while(pendingMessages.length > 0) {
      if(!isConnected) break
      const message = pendingMessages.splice(0,1)[0] //splice preserves the array object with an element missing, so i dont need to reassign
      _send(message)
    }
  }
  webSocket.onclose = (event) => {
    isConnecting = false
    isConnected = false

    if(Date.now() - lastSendInstant < 1000*60*5)
      doConnect()
  }
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = (event) => {
    isConnecting = false
    console.err('Socket Error: ' + JSON.stringify(event))
  }
}

function send(text, level) {
  const parcel = {
    'type': 'trace',
    'payload': {
      bundle: _bundle,
      instant: Date.now(),
      level: level,
      text: text,
    }
  }
  const message = JSON.stringify(parcel)
  _send(message)
}

function _send(message) {
  if(isConnected) {
    webSocket.send(message)
  }
  else {
    pendingMessages.push(message)
    if(!isConnecting)doConnect()
  }
  lastSendInstant = Date.now()
}

export function register(url, bundle) {
  _url = url
  _bundle = bundle
  doConnect()
}

export function logv(message) {
  send(message, 'v')
}

export function logd(message) {
  send(message, 'd')
}

export function logi(message) {
  send(message, 'i')
}

export function logw(message) {
  send(message, 'w')
}

export function loge(message) {
  send(message, 'e')
}

export function v(message) {
  logv(message)
}

export function d(message) {
  logd(message)
}

export function i(message) {
  logi(message)
}

export function w(message) {
  logw(message)
}

export function e(message) {
  loge(message)
}

export default {
  register,
  logv, logd, logi, logw, loge,
  v, d, i, w, e,
}
