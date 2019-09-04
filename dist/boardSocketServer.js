'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var credentials = {
    key: _fs2.default.readFileSync(__dirname + '/privkey.pem'),
    cert: _fs2.default.readFileSync(__dirname + '/cert.pem'),
    ca: _fs2.default.readFileSync(__dirname + 'chain.pem')
};
var port = 8081;

var app = (0, _express2.default)();

var server = _http2.default.createServer(app);
var httpServer = require('https').createServer(credentials, app);

var io = (0, _socket2.default)(httpServer);

var clients = [];

io.on('connection', function (socket) {
    console.log('User connected');
    // User should send data object of board 
    socket.on('login', function (data) {
        socket.boardId = data.board.id;
        socket.userEmail = data.user.email;
        console.log('user login:', data.user.email);
        clients.push(socket);
    });

    // when someone delete card
    socket.on('delete-card', function (data) {
        // data will be a card object
        // First, find users who is in same board and is not a sender. 
        var targets = clients.filter(function (client) {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        });
        // Then, send data to the targets with function named 'delete-list'
        targets.map(function (target) {
            target.emit('delete-card', data);
        });
    });

    //When someone post new card 
    socket.on('post-card', function (data) {
        // data is maybe card object
        // First, find users who is in same board and is not a sender. 
        var targets = clients.filter(function (client) {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        });
        // Then, send data to the targets with function named 'delete-list'
        targets.map(function (target) {
            target.emit('post-card', data);
        });
    });

    //When someone delete list
    socket.on('delete-list', function (data) {
        // data should be list id
        // First, find users who is in same board and is not a sender. 
        var targets = clients.filter(function (client) {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        });
        // Then, send data to the targets with function named 'delete-list'
        targets.map(function (target) {
            target.emit('delete-list', data);
        });
    });

    // When someone add list
    socket.on('post-new-list', function (data) {
        // data should be list object
        // First, find users who is in same board and is not a sender.

        var targets = clients.filter(function (client) {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        });

        // Then, send data to the targets with function named 'post-new-list'
        targets.map(function (target) {
            target.emit('post-new-list', data);
        });
    });

    socket.on('disconnect', function () {
        console.log('user disconnected', socket.boardId, socket.userEmail);
        clients = clients.filter(function (client) {
            if (client.boardId === socket.boardId && client.userEmail === socket.userEmail) {
                return false;
            } else {
                return true;
            }
        });
    });
});

httpServer.listen(port, function () {
    return console.log('Listening on port ' + port);
});