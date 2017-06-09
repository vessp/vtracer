const NODE_ENV = process.env.NODE_ENV
const config = {
    NODE_ENV: NODE_ENV,
    isProduction: NODE_ENV == 'production',
    isDevelopment: NODE_ENV == 'development',
}
//----------------

// if(config.isDevelopment) {
//   if (!require("piping")("./server/vtracer-server.js")) { 
    
//   } else {
//     startServer()
//   }
// }
// else {
//   startServer()
// }
startServer()

//----------------
function startServer() {
  console.log('startServer()')
  const vServer = require('./vtracer-server.js')
  vServer.start()
}
