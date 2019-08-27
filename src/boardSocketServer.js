import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const port = 8081

const app = express()

const server = http.createServer(app);

const io = socketIO(server)

let clients = []

io.on('connection', socket => {
    console.log('User connected');
    // User should send data object of board 
    socket.on('login', data => {
        socket.boardId = data.board.id
        socket.userEmail = data.user.email
        console.log('user login:', data.user.email)
        clients.push(socket)
    })

    // when someone delete card
    socket.on('delete-card', data => {
        // data will be a card object
        // First, find users who is in same board and is not a sender. 
        const targets = clients.filter(client => {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        })
        // Then, send data to the targets with function named 'delete-list'
        targets.map(target => {
            target.emit('delete-card', data)
        })
    })

    //When someone post new card 
    socket.on('post-card', data => {
        // data is maybe card object
        // First, find users who is in same board and is not a sender. 
        const targets = clients.filter(client => {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        })
        // Then, send data to the targets with function named 'delete-list'
        targets.map(target => {
            target.emit('post-card', data)
        })
    })

    //When someone delete list
    socket.on('delete-list', data => {
        // data should be list id
        // First, find users who is in same board and is not a sender. 
        const targets = clients.filter(client => {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        })
        // Then, send data to the targets with function named 'delete-list'
        targets.map(target => {
            target.emit('delete-list', data)
        })
    })

    // When someone add list
    socket.on('post-new-list', data => {
        // data should be list object
        // First, find users who is in same board and is not a sender.

        const targets = clients.filter(client => {
            if (client.boardId === socket.boardId && client.userEmail !== socket.userEmail) {
                return true;
            } else {
                return false;
            }
        })



        // Then, send data to the targets with function named 'post-new-list'
        targets.map(target => {
            target.emit('post-new-list', data)
        })
    })

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.boardId, socket.userEmail)
        clients = clients.filter(client => {
            if (client.boardId === socket.boardId && client.userEmail === socket.userEmail) {
                return false;
            } else {
                return true;
            }
        })

    })
})


server.listen(port, () => console.log(`Listening on port ${port}`))