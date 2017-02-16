'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.logv = logv;
exports.logd = logd;
exports.logi = logi;
exports.logw = logw;
exports.loge = loge;
var webSocket = null;
var isConnected = false;
var isConnecting = false;
var lastSendInstant = 0;
var pendingMessages = [];

var _url = null;
var _bundle = null;

function doConnect() {
  isConnecting = true;
  webSocket = new WebSocket(_url);

  webSocket.onopen = function (event) {
    isConnecting = false;
    isConnected = true;
    while (pendingMessages.length > 0) {
      if (!isConnected) break;
      var message = pendingMessages.splice(0, 1)[0]; //splice preserves the array object with an element missing, so i dont need to reassign
      _send(message);
    }
  };
  webSocket.onclose = function (event) {
    isConnecting = false;
    isConnected = false;

    if (Date.now() - lastSendInstant < 1000 * 60 * 5) doConnect();
  };
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = function (event) {
    isConnecting = false;
    console.err('Socket Error: ' + JSON.stringify(event));
  };
}

function send(text, level) {
  var parcel = {
    'type': 'trace',
    'payload': {
      bundle: _bundle,
      instant: Date.now(),
      level: level,
      text: text
    }
  };
  var message = JSON.stringify(parcel);
  _send(message);
}

function _send(message) {
  if (isConnected) {
    webSocket.send(message);
  } else {
    pendingMessages.push(message);
    if (!isConnecting) doConnect();
  }
  lastSendInstant = Date.now();
}

function register(url, bundle) {
  _url = url;
  _bundle = bundle;
  doConnect();
}

function logv(message) {
  send(message, 'v');
}

function logd(message) {
  send(message, 'd');
}

function logi(message) {
  send(message, 'i');
}

function logw(message) {
  send(message, 'w');
}

function loge(message) {
  send(message, 'e');
}

exports.default = {
  register: register, logv: logv, logd: logd, logi: logi, logw: logw, loge: loge
};