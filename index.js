/*
* Homework Assignment 6
*
*/
"use strict";

//dependencies
const http = require('http');
const url = require('url');
const cluster = require('cluster');
const os = require('os');

// container for the app
let app = {};

//Instantiate server
app.httpServer = http.createServer( (req,res) => app.serverLogic(req,res) );

//Start server
app.startServer = () => {
    app.httpServer.listen(3000,() => {
      console.log(`httpServer is listening on port 3000, Worker id is ${cluster.worker.id}.`);
    });
};

//Server
app.serverLogic = (req,res) => {
  //Get requested path and strip out / from end and begining
  let path = url.parse(req.url,false).pathname.replace(/^\/+|\/+$/g,'');

  //Nothing to do with data here but 'end' event seems to never occure without this
  req.on('data', (data) => {});
  //Requete finished send a response
  req.on('end',() => {
    //Chose handler based on requested path
    let chosenHandler = typeof(app.router[path]) !== 'undefined' ? app.router[path] : app.handlers.notFound;

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
app.handlers = {};

app.handlers.hello = (callback) => {
  callback(200,{'message':`Hello World from worker id ${cluster.worker.id}`});
}

app.handlers.notFound = (callback) => {
  callback(404);
  }

//Router
app.router = {};

app.router.hello = app.handlers.hello;

// Initialisation
app.init = () => {
  if(cluster.isMaster) {
    for(let i=0; i < os.cpus().length;i++) {
      cluster.fork();
    }
  } else {
    // This is a fork start the app
    app.startServer();
  }
};

// Start the app
app.init();
