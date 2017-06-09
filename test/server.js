const express = require('express')
const path = require('path')
const vServer = require('vtracer-server')
vServer.start()


//-----------------------------------------------------------
const PORT = process.env.PORT || 3066;
const INDEX = path.join(__dirname, '/index.html');
const JS = path.join(__dirname, '/index.js');


const app = express()

app.use("/bin", express.static('bin'))

app.route('/')
  .get((req, res) => {
    res.sendFile(INDEX)
  })

const server = app.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`)
})
//-----------------------------------------------------------
