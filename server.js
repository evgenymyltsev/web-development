const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

let nextId = 1;

const suggestions = [{
    id: 1,
    title: 'Знакомство с серверной разработкой',
    voters: new Set(),
}];

const sessions = {};

const server = express();

server.set('view engine', 'pug');

server.use(express.static('public'))
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use((req, res, next) => {
    const username = req.cookies.username;

    req.username = username;
    res.locals.username = username;

    next();
});

server.use((req, res, next) => {
    if (req.cookies.sessionId && sessions[req.cookies.sessionId]) {
        req.session = sessions[req.cookies.sessionId];
    } else {
        const sessionId = crypto.randomBytes(8).toString('hex');
        const session = { id: sessionId };

        sessions[sessionId] = session;

        res.cookie('sessionId', sessionId);

        res.session = session;
    }

    next();
});

server.use((req, res, next) => {
    if (req.session && req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
    }

    next();
});

server.get('/', (req, res) => {
    res.render('index');
});

server.post('/', (req, res) => {
    req.session.username = req.body.username;

    res.redirect('/')
});

server.use((req, res, next) => {
    if (req.session && !req.session.username) {
        res.redirect('/');
    } else {
        next();
    }
});

server.get('/suggestions', (req, res) => {
    res.render('suggestions', {
        suggestions
    })
});

server.post('/suggestions', (req, res) => {
    const title = req.body.title;
    suggestions.push({
        id: ++nextId,
        title,
        voters: new Set(),
    });

    req.session.message = 'Предложение принято';

    res.redirect('/suggestions');
});

server.get('/suggestions/:id', (req, res) => {
    const suggestion = suggestions.find(suggestion =>
        suggestion.id == req.params.id
    );
    res.render('suggestion', {
        suggestion
    });
});

server.post('/suggestions/:id', (req, res) => {
    const username = req.username;
    const suggestion = suggestions.find(suggestion =>
        suggestion.id == req.params.id
    );

    if (suggestion.voters.has(username)) {
        suggestion.voters.delete(username);
        req.session.message = 'Голос отменен';
    } else {
        suggestion.voters.add(username);
        req.session.message = 'Голос принят';
    }
    res.redirect('back')
});

server.listen(3000, 'localhost', () => console.log('Server is running'));