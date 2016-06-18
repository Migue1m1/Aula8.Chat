// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Servidor escuchando en puerto %d', port);
});


var numUsuarios = 0;
var ROOMS = {};
var CLIENTS = {};

for (var i = 0; i < 3; i++)
{
  ROOMS["room"+i] = "room" + i;
}
ROOMS["room"+3] = "room" + 3;
//console.log(ROOMS);

io.on('connection', function (socket) {

  var usuarioAñadido = false;

  socket.on('room', function (room)
    {
      socket.room = room;
      socket.join (room);
    }

  );

  socket.on('send_audio', function(data)
  {
      socket.broadcast.to(socket.room).emit('get_audio', 
      {
          audio:data.audio
      })
  });

  socket.on('nuevo mensaje', function (data) {

    socket.broadcast.to(socket.room).emit('nuevo mensaje', {
      nombre_Usuario: socket.username,
      mensaje: data
    });
  });


  socket.on('agregar usuario', function (nombre_Usuario) {
    if (usuarioAñadido) return;


    socket.username = nombre_Usuario;
    ++numUsuarios;
    usuarioAñadido = true;
    socket.emit('iniciar sesion', {
      numUsuarios: numUsuarios
    });

    socket.broadcast.to(socket.room).emit('usuario unido', {
      nombre_Usuario: socket.username,
      numUsuarios: numUsuarios
    });

    console.log('Alguien se conectó con Aula 8', socket.request.connection._peername);
  });


  socket.on('escribiendo', function ()
  {
    socket.broadcast.to(socket.room).emit('escribiendo', {
      nombre_Usuario: socket.username
    });
  });


  socket.on('no escribiendo', function () {
    socket.broadcast.to(socket.room).emit('no escribiendo', {
      nombre_Usuario: socket.username
    });
  });

  socket.on('enviar imagen', function (data) {
    socket.broadcast.to(socket.room).emit('enviar imagen', {
      nombre_Usuario: socket.username,
      img_Codificada: data
    });
  });


  socket.on('disconnect', function () {
    if (usuarioAñadido) {
      --numUsuarios;

      console.log('Alguien se desconectó de Aula 8', socket.request.connection._peername);

      socket.broadcast.to(socket.room).emit('usuario desconectado', {
        nombre_Usuario: socket.username,
        numUsuarios: numUsuarios
      });
    }
  });
});
