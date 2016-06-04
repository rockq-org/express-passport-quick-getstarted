'use strict';

/*
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

const users = require('../app/controllers/users');
const articles = require('../app/controllers/articles');
const comments = require('../app/controllers/comments');
const tags = require('../app/controllers/tags');
const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
    failureRedirect: '/login'
};

/**
 * Expose routes
 */

module.exports = function(app, passport) {
    const pauth = passport.authenticate.bind(passport);

    // user routes
    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout);
    app.post('/users', users.create);
    // a simple way
    // app.post('/users/session',
    //   pauth('local', {
    //     failureRedirect: '/login',
    //     failureFlash: 'Invalid email or password.'
    //   }), users.session);
    app.post('/users/signin', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log('System error.');
                return next();
            }
            if (user) {
                console.log('Login success!');
                // Login is successful  
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    } else {
                        // process further job
                        // response as json or redirect.
                        res.redirect('/articles/');
                    }
                });
            } else {
                console.log('User not exist or wrong password.')
                return next();
            }

        })(req, res, next);

    });
    app.get('/users/:userId', users.show);
    app.get('/auth/github', pauth('github', fail), users.signin);
    app.get('/auth/github/callback', pauth('github', fail), users.authCallback);
    app.param('userId', users.load);

    // article routes
    app.param('id', articles.load);
    app.get('/articles', articles.index);
    app.get('/articles/new', auth.requiresLogin, articles.new);
    app.post('/articles', auth.requiresLogin, articles.create);
    app.get('/articles/:id', articles.show);
    app.get('/articles/:id/edit', articleAuth, articles.edit);
    app.put('/articles/:id', articleAuth, articles.update);
    app.delete('/articles/:id', articleAuth, articles.destroy);

    // home route
    app.get('/', articles.index);

    // comment routes
    app.param('commentId', comments.load);
    app.post('/articles/:id/comments', auth.requiresLogin, comments.create);
    app.get('/articles/:id/comments', auth.requiresLogin, comments.create);
    app.delete('/articles/:id/comments/:commentId', commentAuth, comments.destroy);

    // tag routes
    app.get('/tags/:tag', tags.index);


    /**
     * Error handling
     */

    app.use(function(err, req, res, next) {
        // treat as 404
        if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }

        console.error(err.stack);

        if (err.stack.includes('ValidationError')) {
            res.status(422).render('422', { error: err.stack });
            return;
        }

        // error page
        res.status(500).render('500', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });
};
