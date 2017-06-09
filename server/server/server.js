//this file is a cmd entry point, run this file directly from node (node server.js)


const NODE_ENV = process.env.NODE_ENV
const config = {
    NODE_ENV: NODE_ENV,
    isProduction: NODE_ENV == 'production',
    isDevelopment: NODE_ENV == 'development',
}
//----------------

if(config.isDevelopment) {
  if (!require("piping")("./server/server.js")) { 
    
  } else {
    startServer()
  }
}
else {
  startServer()
}

//----------------
function startServer() {
  const vServer = require('./vtracer-server.js')
  vServer.start()
}
