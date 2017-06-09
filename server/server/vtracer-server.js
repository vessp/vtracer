'use strict'

const express = require('express')
const path = require('path')
const axios = require('axios')

//SERVER--------------------------------------------------------------------------
function start(_port) {
  const PORT = _port || process.env.PORT || 3065
  const INDEX = path.join(__dirname, '/../site/index.html')
  const BIN = path.join(__dirname, '/../site/bin')


  const app = express()
  app.use("/site/bin", express.static(BIN))

  //allow requests from other domains (CORS)
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  })

  app.route('/')
    .get((req, res) => {
      res.sendFile(INDEX)
    })

  app.post('/traces', function(req, res) {
    // console.log('/traces received')
    let postData = '';
    req.on('data', function (chunk) {
      postData += chunk
    })
    req.on('end', function() {
      const trace = JSON.parse(postData)
      // console.log('posted trace', trace)
      yell({type:'trace', payload:trace})
      res.end('success')
    });
  })

  app.get('/test/:level?', function(req, res) {
    const sampleTrace = {
      bundle: 'com.foo.bar.' + Date.now(),
      instant: Date.now(),
      level: req.params.level || 'v',
      //text: JSON.stringify({a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}),
      text: 'test trace ' + Date.now()
        + JSON.stringify({a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}})
        + 'asdf',

    }

    yell({
      type:'trace',
      payload: sampleTrace
    })

    // axios.post('http://localhost:3000/traces', sampleTrace)
    //   .then(() => {
    //     console.log('res success')
    //   })
    //   .catch((error) => {
    //     console.log('res error', error)
    //   })

    res.end('success')
  })

  app.get('/env', function(req, res) {
    res.end('config: ' + JSON.stringify(config, null, 2))
  })

  const server = app.listen(PORT, () => {
      console.log(`VTracer Listening on ${ PORT }`)
  });

  // console.log('lr', require('livereload'))
  // var lrserver = require('livereload').createServer({
  //     originalPath: "http://localhost:3000/"
  // })
  // lrserver.watch(__dirname + '/server.js')

  //WEB SOCKET--------------------------------------------------------------------------
  const SocketServer = require('ws').Server
  const wss = new SocketServer({ server });
  var userCount = 0

  wss.on('connection', (ws) => {
    // console.log('Client connected')
    userCount++
    // console.log('+user -> ' + userCount)
    yell({type:'userCount', payload:userCount})

    ws.on('close', () => {
      // console.log('Client disconnected')
      userCount--
      // console.log('-user -> ' + userCount)
      yell({type:'userCount', payload:userCount})
    })

    ws.on('message', (jparcel) => {
      // console.log('onmessage: ', jparcel)
      const parcel = JSON.parse(jparcel)
      if(parcel.type == 'trace')
      {
        yell(parcel, ws)
      }
    })
  })

  function whisper(ws, parcel) {
    try {
      ws.send(JSON.stringify(parcel))
    } catch (e) {
      console.log('whisper Error', e)
    }
  }

  function yell(parcel, sendingWs=null) {
    wss.clients.forEach(ws => {
      if(ws != sendingWs)
        whisper(ws, parcel)
    })
  }
}

module.exports = {start}