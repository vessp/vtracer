const vtracer = require('vtracer')
// const axios = require('axios')

// vtracer.setConfig({
//   serverUrl: 'ws://localhost:3065',
//   bundle: 'TEST',
//   onConnectedMessage: '---test client connected---',
// })


document.getElementById('vbut').onclick = function () {
  if(vtracer.isUsingHttp())
    vtracer.setConfig({serverUrl: 'ws://localhost:3065'})
  vtracer.logv('asdf') 
}

document.getElementById('dbut').onclick = function () {
  if(vtracer.isUsingHttp())
    vtracer.setConfig({serverUrl: 'ws://localhost:3065'})
  vtracer.logd('asdf')
}

document.getElementById('postbut').onclick = function () { 
  // axios.post('http://localhost:3065/traces', {
  //   level: 'i',
  //   bundle: 'TEST',
  //   text: 'potin!!'
  // })
  if(vtracer.isUsingWs())
    vtracer.setConfig({serverUrl: 'http://localhost:3065'})
  vtracer.i('potin boys')
}
