'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setConfig = setConfig;
exports.logv = logv;
exports.logd = logd;
exports.logi = logi;
exports.logw = logw;
exports.loge = loge;
exports.v = v;
exports.d = d;
exports.i = i;
exports.w = w;
exports.e = e;
var webSocket = null;
var _isConnected = false;
var isConnecting = false;
var lastSendInstant = 0;
var pendingTraces = [];

var _url = null;
var _bundle = null;

function doConnect() {
  if (_url == null) {
    console.log('vtracer error: cannot connect because url is null');
    return;
  }

  _isConnected = false;
  isConnecting = true;
  webSocket = new WebSocket(_url);

  webSocket.onopen = function (event) {
    isConnecting = false;
    _isConnected = true;
    while (pendingTraces.length > 0) {
      if (!_isConnected) break;
      var jtrace = pendingTraces.splice(0, 1)[0]; //splice preserves the array object with an element missing, so i dont need to reassign
      _send(jtrace);
    }
  };
  webSocket.onclose = function (event) {
    isConnecting = false;
    _isConnected = false;

    if (Date.now() - lastSendInstant < 1000 * 60 * 5) doConnect();
  };
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = function (event) {
    isConnecting = false;
    console.err('Socket Error: ' + JSON.stringify(event));
  };
}

function send(level) {
  for (var _len = arguments.length, messages = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    messages[_key - 1] = arguments[_key];
  }

  var parcel = {
    'type': 'trace',
    'payload': {
      bundle: _bundle,
      instant: Date.now(),
      level: level,
      text: messages.join(', ')
    }
  };

  var jtrace = JSON.stringify(parcel);
  _send(jtrace);
}

function _send(jtrace) {
  if (_isConnected) {
    webSocket.send(jtrace);
  } else {
    pendingTraces.push(jtrace);
    if (!isConnecting) doConnect();
  }
  lastSendInstant = Date.now();
}

function setConfig(config) {
  if (!config.url) console.log('vtracer error: config.url is null');

  _url = config.url;
  _bundle = config.bundle;
  doConnect();
}

function logv() {
  for (var _len2 = arguments.length, messages = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    messages[_key2] = arguments[_key2];
  }

  send.apply(undefined, ['v'].concat(messages));
}

function logd() {
  for (var _len3 = arguments.length, messages = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    messages[_key3] = arguments[_key3];
  }

  send.apply(undefined, ['d'].concat(messages));
}

function logi() {
  for (var _len4 = arguments.length, messages = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    messages[_key4] = arguments[_key4];
  }

  send.apply(undefined, ['i'].concat(messages));
}

function logw() {
  for (var _len5 = arguments.length, messages = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    messages[_key5] = arguments[_key5];
  }

  send.apply(undefined, ['w'].concat(messages));
}

function loge() {
  for (var _len6 = arguments.length, messages = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    messages[_key6] = arguments[_key6];
  }

  send.apply(undefined, ['e'].concat(messages));
}

function v() {
  logv.apply(undefined, arguments);
}

function d() {
  logd.apply(undefined, arguments);
}

function i() {
  logi.apply(undefined, arguments);
}

function w() {
  logw.apply(undefined, arguments);
}

function e() {
  loge.apply(undefined, arguments);
}

exports.default = {
  setConfig: setConfig, isConnected: function isConnected() {
    return _isConnected;
  },
  logv: logv, logd: logd, logi: logi, logw: logw, loge: loge,
  v: v, d: d, i: i, w: w, e: e
};