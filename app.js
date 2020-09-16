/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const moment = require('moment');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ silent: true });

/**
 * Controllers (route handlers).
 */
const userController = require('./controllers/user');
const projectsController = require('./controllers/projects');
const locksController = require('./controllers/locks');
const cardsController = require('./controllers/cards');
const logController = require('./controllers/access-log');
const apiController = require('./controllers/api');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connection.openUri(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Set moment library to be used in templates
 */
app.locals.moment = moment;



const multer = require('multer');
const upload = multer({dest:'./public/img/'});
app.use(multer({dest:"./public/img/"}).single("profile_pic"));

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//上传头像请求
app.post('/account/changePortrait', passportConfig.isAuthenticated, userController.changePortrait);
//配置静态资源请求
app.use('/public', express.static('public'));


app.use((req, res, next) => {
  lusca.csrf()(req, res, next);
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

//扫描二维码显示个人信息，无需登录验证
const User = require('./models/User');
app.use((req, res, next) => {
  if (!req.user &&
    req.path.indexOf('/account/getPersonalInformation')>-1){
    User.findById(req.query.id, (err, user) => {
    if (err) { return next(err); }
    res.render('account/personalInformation', {
      title: 'personalInformation',
      user
    });
  });
  }else{next();}

});

app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', (req, res) => res.redirect('/locks'));
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.get('/account/findByEmail:email', passportConfig.isAuthenticated, userController.findByEmail);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/profile2', passportConfig.isAuthenticated, userController.postUpdateProfile2);
app.get('/account/creatIDCard/:id', passportConfig.isAuthenticated, userController.creatIDCard);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/accountList', passportConfig.isAuthenticated, userController.accountList);
app.post('/account/delete2', passportConfig.isAuthenticated, userController.postDeleteAccount2);

app.get('/projects', passportConfig.isAuthenticated, projectsController.index);
app.get('/myProjects', passportConfig.isAuthenticated, projectsController.findMyProjects);
app.post('/myProjects', passportConfig.isAuthenticated, projectsController.postProject);
app.get('/projects/:id', passportConfig.isAuthenticated, projectsController.showProject);
app.post('/projects/:id', passportConfig.isAuthenticated, projectsController.updateProject);
app.post('/projects', passportConfig.isAuthenticated, projectsController.postProject);
app.get('/projects/delete/:id', passportConfig.isAuthenticated, projectsController.deleteProject);

app.get('/locks', passportConfig.isAuthenticated, locksController.index);
app.get('/locks/:id', passportConfig.isAuthenticated, locksController.showLock);
app.post('/locks/:id', passportConfig.isAuthenticated, locksController.updateLock);
app.post('/locks', passportConfig.isAuthenticated, locksController.postLock);
app.get('/locks/delete/:id', passportConfig.isAuthenticated, locksController.deleteLock);
app.get('/cards', passportConfig.isAuthenticated, cardsController.index);
app.get('/cards/findMyCards:email', passportConfig.isAuthenticated, cardsController.findMyCards);
app.get('/cards/:id', passportConfig.isAuthenticated, cardsController.showCard);
app.post('/cards/:id', passportConfig.isAuthenticated, cardsController.updateCard);
app.get('/card-apply/:id', cardsController.showCardApply);
app.post('/card-apply/:id', cardsController.doCardApply);
app.get('/cards/delete/:id', passportConfig.isAuthenticated, cardsController.deleteCard);
app.get('/cards/delete2/:id', passportConfig.isAuthenticated, cardsController.deleteCard2);
app.get('/cards/creatAccountByCard/:id', passportConfig.isAuthenticated, cardsController.creatAccountByCard);
app.get('/access-log:inxday', passportConfig.isAuthenticated, logController.index);
app.get('/access-log/score/report', passportConfig.isAuthenticated, logController.score_report);
app.get('/access-log/:id', passportConfig.isAuthenticated, logController.showScore);
app.post('/access-log/:id', passportConfig.isAuthenticated, logController.updateScore);
app.get('/api/v1/access', apiController.index);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
