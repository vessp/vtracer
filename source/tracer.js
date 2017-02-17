'use strict'

let webSocket = null
let isConnected = false
let isConnecting = false
let lastSendInstant = 0
let pendingTraces = []

let _url = null
let _bundle = null

function doConnect() {
  if(_url == null) {
    console.log('vtracer error: cannot connect because url is null')
    return
  }

  isConnected = false
  isConnecting = true
  webSocket = new WebSocket(_url)

  webSocket.onopen = (event) => {
    isConnecting = false
    isConnected = true
    while(pendingTraces.length > 0) {
      if(!isConnected) break
      const jtrace = pendingTraces.splice(0,1)[0] //splice preserves the array object with an element missing, so i dont need to reassign
      _send(jtrace)
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

function send(level, ...messages) {
  const parcel = {
    'type': 'trace',
    'payload': {
      bundle: _bundle,
      instant: Date.now(),
      level: level,
      text: messages.join(', '),
    }
  }

  const jtrace = JSON.stringify(parcel)
  _send(jtrace)
}

function _send(jtrace) {
  if(isConnected) {
    webSocket.send(jtrace)
  }
  else {
    pendingTraces.push(jtrace)
    if(!isConnecting)doConnect()
  }
  lastSendInstant = Date.now()
}

export function setConfig(config) {
  if(!config.url)
    console.log('vtracer error: config.url is null')

  _url = config.url
  _bundle = config.bundle
  doConnect()
}

export function logv(...messages) {
  send('v', ...messages)
}

export function logd(...messages) {
  send('d', ...messages)
}

export function logi(...messages) {
  send('i', ...messages)
}

export function logw(...messages) {
  send('w', ...messages)
}

export function loge(...messages) {
  send('e', ...messages)
}

export function v(...messages) {
  logv(...messages)
}

export function d(...messages) {
  logd(...messages)
}

export function i(...messages) {
  logi(...messages)
}

export function w(...messages) {
  logw(...messages)
}

export function e(...messages) {
  loge(...messages)
}

export default {
  setConfig, isConnected:() => isConnected,
  logv, logd, logi, logw, loge,
  v, d, i, w, e,
}
