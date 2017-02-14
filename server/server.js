'use strict'

const express = require('express')
const path = require('path')
const busboy = require('connect-busboy') //middleware for form/file upload
const fs = require('fs-extra')       //File System - for file manipulation
const multer = require('multer')

if (!require("piping")("./server/server.js")) { return }


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, './public');
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage}).single('audioFile');



//SERVER--------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/../site/index.html');
//const INDEX = path.join(__dirname, '/site/index2.html');


const app = express()
//app.use(busboy());
app.use(express.static('public'))
// app.use("/dist", express.static('dist'))
app.use("/site", express.static('site'))

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

// app.post('/upload', function(req,res){

//     console.log(req.raw)
//     upload(req,res,function(err) {
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         res.redirect("/");
//         yellPlaylist()
//     });

    /*
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        if (!fs.existsSync(__dirname + '/public/')){
            fs.mkdirSync(__dirname + '/public/');
        }

        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/public/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {    
            console.log("Upload Finished of " + filename);              
            res.redirect('back');           //where to go next
            wss.clients.forEach((client) => {
                sendFileList(client)
              });
        });
    });
    */
// });

// app.get('/apps/:name', function(req, res){
//     const name = req.params.name

//     if(name == 'kindred') {
//         res.writeHead(200, {
//             'Content-Type': "application/json",
//             'Cache-Control': 'no-cache'
//         })
//         res.end(JSON.stringify({
//             version: '1.1.2',
//             distPath: '/dist/Kindred-win32-x64.zip'
//         }))
//     }
//     else {
//         res.end(JSON.stringify({
//             success: false,
//             message: 'app with name "' + name + '" not found'
//         }))
//     }
// });

// app.post('/audio', function(req, res) {
//     var postData = '';
//     req.on('data', function (chunk) {
//         postData += chunk
//     })
//     req.on('end', function() {
//         postData = JSON.parse(postData)
//         const name = postData.name
//         const data = new Buffer(postData.data)
//         DB.insertAudio(name, data, () => {
//             res.end('success')
//             yellPlaylist()
//         }, () => {
//             res.end('error')
//         })
//     });
// })

// app.get('/play/:name', (req, res) => {
//     const name = req.params.name
//     yellPlay(name)
//     res.end('play message sent!')
// })

const server = app.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`)
});

// console.log('lr', require('livereload'))
// var lrserver = require('livereload').createServer({
//     originalPath: "http://localhost:3000/"
// })
// lrserver.watch(__dirname + '/server.js')


//DATABASE--------------------------------------------------------------------------
// const DB = require('./app/db')
//DB.init()
// app.get('/audio/:name', function(req, res){
//     const name = req.params.name
//     DB.selectAudio(name, (fileBytes) => {
//         res.writeHead(200, {
//             'Content-Type': "audio/mpeg",
//             'Content-Disposition': `inline; filename="${name}"`,
//             'Cache-Control': 'no-cache'
//         })
//         res.end(fileBytes);
//     }, (err) => {
//         res.end(err.message);
//     })
// });

//WEB SOCKET--------------------------------------------------------------------------
const SocketServer = require('ws').Server
const wss = new SocketServer({ server });
var userCount = 0
var hangoutsCount = 0

wss.on('connection', (ws) => {
  console.log('Client connected');
  userCount++

  var traceCount = 0
  const intervalId = setInterval(() => {
    traceCount++
    whisper(ws, {
      'type':'trace',
      'payload': {
        bundle: 'com.vessp.app'+traceCount,
        instant: Date.now(),
        text:"[MyComponent] myTraceMessage" + traceCount
      }
    })
    // if(traceCount > 3)
    //   clearInterval(intervalId)
  }, 1500)

  ws.on('close', () => {
      console.log('Client disconnected');
  })

  ws.on('message', (jparcel) => {
      console.log('onmessage: ', parcel)
      const parcel = JSON.parse(jparcel)
      if(parcel.type == 'trace')
      {
        // yell(parcel)
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

function yell(parcel) {
  wss.clients.forEach(ws => whisper(ws, parcel))
}

// function whisperVersion(ws){
//     ws.send(JSON.stringify(
//     {
//         'type':'version',
//         'message': "1.1"
//     }
//     ))
// }

// function whisperPlaylist(ws){
//     DB.queryPlaylist(playlist => {
//         ws.send(JSON.stringify({
//             'type':'playlist',
//             'message': playlist
//         }))
//     })

//     // fs.readdir(__dirname + '/public', (err, files) => {
//     //     if(!files)
//     //         files = []
//     //     ws.send(JSON.stringify(
//     //         {
//     //             'type':'playlist',
//     //             'message': files
//     //         }
//     //         ))
//     // })
// }

// function yellPlaylist() {
//     wss.clients.forEach((client) => {
//         whisperPlaylist(client)
//     });
// }

// function yellPlay(filename) {
//     wss.clients.forEach((client) => {
//         client.send(JSON.stringify(
//             {
//                 'type':'play',
//                 'message': filename
//             }))
//     });
// }

// function yellUserCount() {
//     wss.clients.forEach((ws) => {
//         ws.send(JSON.stringify(
//             {
//                 'type':'userCount',
//                 'message': userCount
//             }
//             ))
//       });
// }

// function yellHangoutsCount() {
//     wss.clients.forEach((ws) => {
//         ws.send(JSON.stringify(
//             {
//                 'type':'hangoutsCount',
//                 'message': hangoutsCount
//             }
//             ))
//       });
// }