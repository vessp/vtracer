'use strict'

// Config-----------------------------------------------------------------------
let defaultConfig = {
  serverUrl: 'ws://localhost:3065', //guess default server
  bundle: '',
  onConnectedMessage: null,
  debug: false
}
let config
let shouldUseWs
let shouldUseHttp
setConfig(defaultConfig, true)

export function setConfig(_config, isInit=false) {
  if(!_config.serverUrl)
    selfLog('vtracer warning: config.serverUrl=' + config.serverUrl)

  setConfigInstant = Date.now()

  config = {}
  for(let key in defaultConfig) {
    config[key] = defaultConfig[key]
  }
  for(let key in _config) {
    config[key] = _config[key]
  }

  shouldUseWs = config.serverUrl.indexOf('ws://') != -1
  shouldUseHttp = config.serverUrl.indexOf('http://') != -1 || config.serverUrl.indexOf('https://') != -1

  if(!isInit)
    correctWsState()
}

// function shouldUseWs() {return config.serverUrl.indexOf('ws://') != -1}
// function shouldUseHttp() {return config.serverUrl.indexOf('http://') != -1 || config.serverUrl.indexOf('https://') != -1}
//------------------------------------------------------------------------------

function selfLog(...args) {
  if(config.debug)
    console.log(...args)
}

//Main API------------------------------------------------------------------------------
export default {
  setConfig, isConnected,
  v, d, i, w, e,
  logv, logd, logi, logw, loge,
  isUsingWs, isUsingHttp,
}

export function v(...args) {logv(...args)}
export function d(...args) {logd(...args)}
export function i(...args) {logi(...args)}
export function w(...args) {logw(...args)}
export function e(...args) {loge(...args)}
export function logv(...messages) {send('v', Date.now(), ...messages)}
export function logd(...messages) {send('d', Date.now(), ...messages)}
export function logi(...messages) {send('i', Date.now(), ...messages)}
export function logw(...messages) {send('w', Date.now(), ...messages)}
export function loge(...messages) {send('e', Date.now(), ...messages)}
export function isUsingWs() {return shouldUseWs}
export function isUsingHttp() {return shouldUseHttp}

function send(level, instant, ...messages) {
  const jsonStringifyHandler = (key,val) => {
    if (typeof val === 'function') {
      return val + '' // implicitly `toString` it
    }
    // else if(typeof val === 'object') {
    //   return val + ''
    // }
    return val
  }

  const text = messages.map(m => {
    if (typeof m === 'string')
      return m
    else
      return JSON.stringify(m, jsonStringifyHandler)
  }).join(', ')

  const payload = {
    bundle: config.bundle,
    instant: instant,
    level: level,
    text: text,
  }

  if(shouldUseWs) {
    const parcel = {'type': 'trace', payload: payload}
    const jtrace = JSON.stringify(parcel, jsonStringifyHandler)
    const successful = sendByWs(jtrace)
    if(!successful && numFailedConnectAttempts>0) {
      selfLog('vtracer sending by ws error, serverUrl: ' + config.serverUrl)
      console.log('[vtracer fallback]' + payload.level + ': ' + payload.text) //fallback to console.log
    }
  }
  else {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.onprogress = function () {
      if(xmlhttp.status != 200) {
        selfLog('vtracer sending by http error, serverUrl: ' + config.serverUrl, xmlhttp)
        console.log('[vtracer fallback]' + payload.level + ': ' + payload.text) //fallback to console.log
      }
    }
    xmlhttp.open('POST', config.serverUrl + '/traces')
    xmlhttp.setRequestHeader('Content-Type', 'application/json')
    xmlhttp.send(JSON.stringify(payload, jsonStringifyHandler))
  }
}

//WebSocket------------------------------------------------------------------------------
function sendByWs(jtrace) {
  let sendSuccessful = false
  if(isConnected()) {
    try {
      webSocket.send(jtrace)
      sendSuccessful = true
    } catch(e){
      selfLog('vtracer send error: event=' + e)
    }
  }
  
  if(!sendSuccessful) {
    if(pendingTraces.length >= MAX_PENDING_LENGTH)
      pendingTraces.splice(0,1) //remove first element
    pendingTraces.push(jtrace)
    selfLog('pushing trace to pendingtraces array, length=' + pendingTraces.length)
    if(!isConnected() && !isConnecting() && !reconnectTimeout)
      doConnect()
  }
  lastSendInstant = Date.now()
  return sendSuccessful
}


let webSocket = null
let lastSendInstant = 0
let pendingTraces = []
let numFailedConnectAttempts = 0
let reconnectTimeout = null
let setConfigInstant = null
const MAX_PENDING_LENGTH = 100

function isConnected() {return webSocket && webSocket.readyState == WebSocket.OPEN}
function isDisconnected() {return !webSocket || webSocket.readyState == WebSocket.CLOSED}
function isConnecting() {return webSocket && webSocket.readyState == WebSocket.CONNECTING}
function isDisconnecting() {return webSocket && webSocket.readyState == WebSocket.CLOSING}

function correctWsState() {
  if(shouldUseHttp && !webSocket)
    return

  if(shouldUseWs) {
    if(webSocket && webSocket.url != config.serverUrl) 
      doConnect()
    else if(isDisconnected())
      doConnect()
  }
  else {
    doDisconnect()
  }
}

function doConnect() {
  // selfLog('doConnect', config.serverUrl)
  if(config.serverUrl == null) {
    selfLog('vtracer error: cannot connect because config.serverUrl is null')
    return
  }

  clearTimeout(reconnectTimeout)
  reconnectTimeout = null
  doDisconnect()
  webSocket = new WebSocket(config.serverUrl)

  webSocket.onopen = (event) => {
    selfLog('vtracer websocket.onopen', webSocket)
    numFailedConnectAttempts = 0

    if(config.onConnectedMessage)
      send('v', setConfigInstant, config.onConnectedMessage)

    while(pendingTraces.length > 0) {
      if(!isConnected()) break
      const jtrace = pendingTraces.splice(0,1)[0] //splice preserves the array object with an element missing, so i dont need to reassign
      const success = sendByWs(jtrace)
      if(!success)
        break
    }
  }
  webSocket.onclose = (event) => {
    webSocket = null
    selfLog('vtracer websocket.onclose, code=' + event.code + ', reason=' + event.reason + ', message=' + event.message)
    
    if(shouldUseWs) {
      numFailedConnectAttempts++
      const timeout = numFailedConnectAttempts <= 1 ? 2000 : 60000//we will always try to reconnect
      reconnectTimeout = setTimeout(() => doConnect(), timeout)
    }
  }
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = (event) => {
    selfLog('vtracer Socket Error: event=' + JSON.stringify(event))
  }
}

function doDisconnect() {
  if(isConnected() || isConnecting()) {
    webSocket.close()
    webSocket = null
  }
}










