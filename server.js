const express = require('express');
const cookieParser = require('cookie-parser');

const server = express();

server.set('view engine', 'pug');

server.use(express.static('public'))

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.get('/', (req, res) => {
    console.log(req.cookies);
    const { username } = req.cookies;
    
    res.render('index', {
        username
    });
});

server.post('/', (req, res) => {
    res.cookie('username', req.body.username);
    res.redirect('/')
});

server.get('/suggestions', (req, res) => {
    throw new Error('not implemented');
});

server.post('/suggestions', (req, res) => {
    throw new Error('not implemented');
});

server.get('/suggestions/1', (req, res) => {
    throw new Error('not implemented');
});

server.post('/suggestions/1', (req, res) => {
    throw new Error('not implemented');
});

server.listen(3000, 'localhost', () => console.log('Server is running'));