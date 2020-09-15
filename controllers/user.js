const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const passport = require('passport');
const User = require('../models/User');


/**
 * User module.
 * @module controllers/user
 */

/**
 * GET /login - Login page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/account');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login - Sign in using email and password.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/locks');
    });
  })(req, res, next);
};

/**
 * GET /logout - Log out.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/login');
};

/**
* GET /signup - Signup page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/locks');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup - Create a new local account.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.assert('email', 'You must use valid e-mail address').contains(process.env.MAIL_STRING);
  req.assert('idcard', 'idcard is not valid').isNull();
  if (req.body.profile.idcard.length<10||req.body.profile.idcard.length>18) {
      console.log(req.body.profile.idcard.length);
      req.flash('errors', { msg: '学号/身份证必须是10-18位' });
      return res.redirect('/signup');
  };

  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password,
    type:'account',
    profile:req.body.profile
  });
  //set default level is 1
    user.profile.level = 1;

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
      });
    });
  });
};

/**
 * GET /account - Profile page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * GET /account/findByEmail- Profile page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.findByEmail = (req, res,next) => {
  User.findOne({email: req.params.email})
  .exec((err, account) =>{
    if (err) return next(err);
    res.render('account/profile2', {
      account
    });
  });
};

/**
 * GET /account/findAccountList - Profile page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.accountList = (req, res,next) => {
  User.find().exec((err, accountList) =>{
    if (err) return next(err);
    res.render('account/accountList', {
      title: 'AccountList',
      accountList
    });
  });
};


/**
 * POST /account/profile - Update profile information.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postUpdateProfile = (req, res, next) => {
  postUpdateProfile(req, res, next);
  req.flash('success', { msg: 'Profile information has been updated.' });
        res.redirect('/account');
};
exports.postUpdateProfile2 = (req, res, next) => {
  postUpdateProfile(req, res, next);
  req.flash('success', { msg: 'Profile information has been updated.' });
        res.redirect('/account/accountList');
};
function postUpdateProfile(req, res, next){
req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }
  User.findById(req.body.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.type = req.body.type || '';
    user.profile.level = req.body.level || '';
    user.profile.idcard = req.body.idcard || '';
    user.profile.mobile = req.body.mobile || '';
    user.profile.qq = req.body.qq || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.profile.description = req.body.description || '';
    user.profile.profield = req.body.profield || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
    });
  });
};

/**
 * POST /account/password - Update current password.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete - Delete user account.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/login');
  });
};
exports.postDeleteAccount2 = (req, res, next) => {
  console.log(req.body.id);
  User.remove({ _id: req.body.id }, (err) => {
    if (err) { return next(err); }
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/account/accountList');
  });
};


/**
 * GET /account/unlink/:provider - Unlink OAuth provider.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token - Reset Password page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/locks');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token - Process the reset password request.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function resetPassword(done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user, done) {
      const transporter = nodemailer.createTransport(mailgunTransport({
        auth: {
          api_key: process.env.MAILGUN_APIKEY,
          domain: process.env.MAILGUN_DOMAIN
        }
      }));
      const mailOptions = {
        to: user.email,
        from: 'locks@paralelnipolis.cz',
        subject: 'Your P.R.A.S.E. password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/locks');
  });
};

/**
 * GET /forgot - Forgot Password page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/locks');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot - Create a random token, then the send user an email with a reset link.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function createRandomToken(done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function setRandomToken(token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token, user, done) {
      const transporter = nodemailer.createTransport(mailgunTransport({
        auth: {
          api_key: process.env.MAILGUN_APIKEY,
          domain: process.env.MAILGUN_DOMAIN
        }
      }));
      const mailOptions = {
        to: user.email,
        from: 'locks@paralelnipolis.cz',
        subject: 'Reset your password on P.R.A.S.E.',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};


/**
 * GET /account/creatIDCard - IdCard page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.creatIDCard = (req, res,next) => {
  console.log(req.user.id);
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    res.render('account/IDCard', {
      title: 'IDCard',
      user
    });
  });
};


const path = require('path');
const fs = require('fs');
/**
 * POST /account/changePortrait - IdCard page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 */
exports.changePortrait= (req, res, next) => {
  //post传输方法要用body
  var fname=req.file.fieldname;//获取上传文件的名字
  var oname=req.file.originalname;//获取上传文件的原始名字
  //var load=path.join(__dirname,'..');返回上一层的地址这里用变量load接收了
  var load=path.join(__dirname,'..');

  /*文件上传后默认是一堆字符串的名字并且没有后缀名称的未知格式文件，
  这里我们要用req.files查看原始文件的数据并且读取，待读取成功后进行下一步操作*/
  fs.readFile(req.file.path,(err,data)=>{
    //读取失败，说明没有上传成功
    if(err){return res.send('上传失败')}
    //否则读取成功，开始写入
    //声明图片名字为时间戳和随机数拼接成的，尽量确保唯一性
    let time=Date.now()+parseInt(Math.random()*999)+parseInt(Math.random()*2222);
    //拓展名
    let extname=req.file.mimetype.split('/')[1]
    //拼接成图片名
    let keepname=time+'.'+extname
    // 三个参数
    //1.图片的绝对路径
    //2.写入的内容
    //3.回调函数
    fs.writeFile(path.join(load,'/public/img/'+keepname),data,(err)=>{
    //写入文件
      if(err){
        return res.send('上传失败');
      }
      User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.profile.picture = '/public/img/'+keepname;
        user.save((err) => {
          if (err) { return next(err); }
          req.flash('success', { msg: 'Portrait has been changed.' });
          res.redirect('/account/creatIDCard/'+req.user.id);
        });
      });
    });
  });
};
