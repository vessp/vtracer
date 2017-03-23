'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.setConfig = setConfig;
exports.logv = logv;
exports.logd = logd;
exports.logi = logi;
exports.logw = logw;
exports.loge = loge;
var webSocket = null;
var _isConnected = false; //webSocket.readyState = WebSocket.OPEN, WebSocket.CLOSED, WebSocket.CONNECTING, WebSocket.CLOSING
var isConnecting = false;
var lastSendInstant = 0;
var pendingTraces = [];
var numFailedConnectAttempts = 0;

var MAX_PENDING_LENGTH = 100;

var defaultConfig = {
  serverUrl: null,
  bundle: '',
  onConnectedMessage: null,
  debug: true
};
var _config = defaultConfig;

function selfLog() {
  var _console;

  if (_config.debug) (_console = console).log.apply(_console, arguments);
}

function doConnect() {
  if (_config.serverUrl == null) {
    selfLog('vtracer error: cannot connect because _config.serverUrl is null');
    return;
  }

  _isConnected = false;
  isConnecting = true;
  webSocket = new WebSocket(_config.serverUrl);

  webSocket.onopen = function (event) {
    isConnecting = false;
    _isConnected = true;
    numFailedConnectAttempts = 0;

    if (_config.onConnectedMessage) logv(_config.onConnectedMessage);

    while (pendingTraces.length > 0) {
      if (!_isConnected) break;
      var jtrace = pendingTraces.splice(0, 1)[0]; //splice preserves the array object with an element missing, so i dont need to reassign
      var success = _send(jtrace);
      if (!success) break;
    }
  };
  webSocket.onclose = function (event) {
    selfLog('vtracer websocket.onclose, code=' + event.code + ', reason=' + event.reason);
    isConnecting = false;
    _isConnected = false;
    numFailedConnectAttempts++;

    // if(Date.now() - lastSendInstant < 1000*60*5)
    //lets try to always be connected for now
    var timeout = numFailedConnectAttempts <= 1 ? 1000 : 60000;
    setTimeout(function () {
      return doConnect();
    }, timeout);
  };
  // webSocket.onmessage = (event) => {

  // }
  webSocket.onerror = function (event) {
    isConnecting = false;
    selfLog('vtracer Socket Error: event=' + event);
  };
}

function send(level) {
  for (var _len = arguments.length, messages = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    messages[_key - 1] = arguments[_key];
  }

  var jsonStringifyHandler = function jsonStringifyHandler(key, val) {
    if (typeof val === 'function') {
      return val + ''; // implicitly `toString` it
    } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
      return val + '';
    }
    return val;
  };

  messages = messages.map(function (m) {
    return JSON.stringify(m, jsonStringifyHandler);
  });

  var parcel = {
    'type': 'trace',
    'payload': {
      bundle: _config.bundle,
      instant: Date.now(),
      level: level,
      text: messages.join(', ')
    }
  };

  var jtrace = JSON.stringify(parcel, jsonStringifyHandler);
  _send(jtrace);
}

function _send(jtrace) {
  var sendSuccessful = false;
  if (_isConnected) {
    try {
      webSocket.send(jtrace);
      sendSuccessful = true;
    } catch (e) {
      selfLog('vtracer send error: event=' + e);
    }
  }

  if (!sendSuccessful) {
    if (pendingTraces.length >= MAX_PENDING_LENGTH) pendingTraces.splice(0, 1); //remove first element
    pendingTraces.push(jtrace);
    if (!_isConnected && !isConnecting) doConnect();
  }
  lastSendInstant = Date.now();
  return sendSuccessful;
}

function setConfig(config) {
  if (!config.serverUrl) selfLog('vtracer warning: config.serverUrl=' + config.serverUrl);

  _config = {};
  for (var key in defaultConfig) {
    _config[key] = defaultConfig[key];
  }
  for (var _key2 in config) {
    _config[_key2] = config[_key2];
  }
  doConnect();
}

function logv() {
  for (var _len2 = arguments.length, messages = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
    messages[_key3] = arguments[_key3];
  }

  send.apply(undefined, ['v'].concat(messages));
}

function logd() {
  for (var _len3 = arguments.length, messages = Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
    messages[_key4] = arguments[_key4];
  }

  send.apply(undefined, ['d'].concat(messages));
}

function logi() {
  for (var _len4 = arguments.length, messages = Array(_len4), _key5 = 0; _key5 < _len4; _key5++) {
    messages[_key5] = arguments[_key5];
  }

  send.apply(undefined, ['i'].concat(messages));
}

function logw() {
  for (var _len5 = arguments.length, messages = Array(_len5), _key6 = 0; _key6 < _len5; _key6++) {
    messages[_key6] = arguments[_key6];
  }

  send.apply(undefined, ['w'].concat(messages));
}

function loge() {
  for (var _len6 = arguments.length, messages = Array(_len6), _key7 = 0; _key7 < _len6; _key7++) {
    messages[_key7] = arguments[_key7];
  }

  send.apply(undefined, ['e'].concat(messages));
}

exports.default = {
  setConfig: setConfig, isConnected: function isConnected() {
    return _isConnected;
  },
  logv: logv, logd: logd, logi: logi, logw: logw, loge: loge,
  v: function v() {
    return logv.apply(undefined, arguments);
  },
  d: function d() {
    return logd.apply(undefined, arguments);
  },
  i: function i() {
    return logi.apply(undefined, arguments);
  },
  w: function w() {
    return logw.apply(undefined, arguments);
  },
  e: function e() {
    return loge.apply(undefined, arguments);
  }
};