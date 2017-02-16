'use strict'

const express = require('express')
const path = require('path')

const isProduction = process.env.NODE_ENV == 'production'

if(!isProduction) {
  if (!require("piping")("./server/server.js")) { return }
}

//SERVER--------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/../site/index.html');


const app = express()
// app.use(express.static('public'))
app.use("/site/bin", express.static('site/bin'))

app.route('/')
    .get((req, res) => {
        res.sendFile(INDEX)
    })

app.post('/traces', function(req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk
    })
    req.on('end', function() {
        postData = JSON.parse(postData)
        // console.log('postData', postData)
        yell({type:'trace', payload:postData.trace})
        // const name = postData.name
        // const data = new Buffer(postData.data)
        // DB.insertAudio(name, data, () => {
            res.end('success')
        //     yellPlaylist()
        // }, () => {
        //     res.end('error')
        // })
    });
})

app.get('/env', function(req, res) {
  res.end('asdf   ' + process.env.NODE_ENV + ', ' + isProduction)
})

const server = app.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`)
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
  console.log('Client connected');
  userCount++

  ws.on('close', () => {
      console.log('Client disconnected');
  })

  ws.on('message', (jparcel) => {
      console.log('onmessage: ', jparcel)
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