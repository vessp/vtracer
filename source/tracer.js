'use strict'

let webSocket = null
let isConnected = false
let isConnecting = false
let lastSendInstant = 0
let pendingTraces = []
let numFailedConnectAttempts = 0

const MAX_PENDING_LENGTH = 100

let defaultConfig = {
  serverUrl: null,
  bundle: '',
  onConnectedMessage: null,
  debug: true
}
let _config = defaultConfig

function selfLog(...args) {
  if(_config.debug)
    console.log(...args)
}

function doConnect() {
  if(_config.serverUrl == null) {
    selfLog('vtracer error: cannot connect because _config.serverUrl is null')
    return
  }

  isConnected = false
  isConnecting = true
  webSocket = new WebSocket(_config.serverUrl)

  webSocket.onopen = (event) => {
    isConnecting = false
    isConnected = true
    numFailedConnectAttempts = 0

    if(_config.onConnectedMessage)
      logv(_config.onConnectedMessage)

    while(pendingTraces.length > 0) {
      if(!isConnected) break
      const jtrace = pendingTraces.splice(0,1)[0] //splice preserves the array object with an element missing, so i dont need to reassign
      _send(jtrace)
    }
  }
  webSocket.onclose = (event) => {
    selfLog('vtracer websocket.onclose, code=' + event.code + ', reason=' + event.reason)
    isConnecting = false
    isConnected = false
    numFailedConnectAttempts++

    // if(Date.now() - lastSendInstant < 1000*60*5)
    //lets try to always be connected for now
    const timeout = numFailedConnectAttempts <= 1 ? 1000 : 60000
    setTimeout(() => doConnect(), timeout)
  }
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = (event) => {
    isConnecting = false
    selfLog('vtracer Socket Error: event=' + event)
  }
}

function send(level, ...messages) {
  const parcel = {
    'type': 'trace',
    'payload': {
      bundle: _config.bundle,
      instant: Date.now(),
      level: level,
      text: messages.join(', '),
    }
  }

  const jtrace = JSON.stringify(parcel)
  _send(jtrace)
}

function _send(jtrace) {
  let sendSuccessful = false
  if(isConnected) {
    try {
      webSocket.send(jtrace)
      sendSuccessful = true
    } catch(e){selfLog('vtracer send error: event=' + e)}
  }
  
  if(!sendSuccessful) {
    if(pendingTraces.length >= MAX_PENDING_LENGTH)
      pendingTraces.splice(0,1) //remove first element
    pendingTraces.push(jtrace)
    if(!isConnected && !isConnecting)
      doConnect()
  }
  lastSendInstant = Date.now()
}

export function setConfig(config) {
  if(!config.serverUrl)
    selfLog('vtracer warning: config.serverUrl=' + config.serverUrl)

  _config = {}
  for(let key in defaultConfig) {
    _config[key] = defaultConfig[key]
  }
  for(let key in config) {
    _config[key] = config[key]
  }
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

export default {
  setConfig, isConnected:() => isConnected,
  logv, logd, logi, logw, loge,
  v: (...args) => logv(...args),
  d: (...args) => logd(...args),
  i: (...args) => logi(...args),
  w: (...args) => logw(...args),
  e: (...args) => loge(...args),
}
