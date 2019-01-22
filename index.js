/*
* Homework Assignment 1
*
*/

//dependencies
const http = require('http');
const url = require('url');

//Instantiate server
let httpServer = http.createServer( (req,res) => serverLogic(req,res) );

//Start server
httpServer.listen(3000,() => {
  console.log('httpServer is listening on port 3000');
});

//Server
let serverLogic = (req,res) => {
  //Get requested path and strip out / from end and begining
  let path = url.parse(req.url,false).pathname.replace(/^\/+|\/+$/g,'');

  //Nothing to do with data here but 'end' event seems to never occure without this
  req.on('data', (data) => {});
  //Requete finished send a response
  req.on('end',() => {
    //Chose handler based on requested path
    let chosenHandler = typeof(router[path]) !== 'undefined' ? router[path] : handlers.notFound;

    chosenHandler( (statusCode,data) => {
      data = typeof(data) === 'object' ? data : {};
      statusCode = typeof(statusCode) === 'number' ? statusCode : 404;
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(JSON.stringify(data));
    })

  });


};

//Handlers
let handlers = {};
handlers.hello = (callback) => {
  callback(200,{'message':'Hello World'});
}
handlers.notFound = (callback) => {
  callback(404);
}

//Router
let router = {};
router.hello = handlers.hello;
