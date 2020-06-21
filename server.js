var express      = require('express');
var http         = require("http");
var app          = express();
var ChildProcess = require("child_process")

var Port = 3000;

var RestartChannel = null

app.get("/", function(request, response)
{
    let datetime = new Date();

    http.get(pingoptions, function(res) {}).on('error', function(e)
    {
        console.error("Got error: " + e.message);
    });
});

app.get("/ping", function(request, response)
{
    let datetime = new Date();
    let pcode = Math.floor(Math.random() * 10239571);
    response.send(`Ping Code: ${pcode}`);
}); 

var listener = app.listen(Port, function()
{
    console.log('App is online! [Port: ' + listener.address().port + ']');
    StartBot()
});

function StartBot()
{
    let sub = ChildProcess.fork(__dirname + "/bot.js");
    sub.send({pID : sub.pid, channel: RestartChannel});
    sub.on("message", c => RestartChannel = c.channel);
    sub.on("exit", StartBot);
}
