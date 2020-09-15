 const Card = require('../models/Card');
const Lock = require('../models/Lock');
const User = require('../models/User');
const Log = require('../models/Log');

/**
 * Log module.
 * @module controllers/cards
 */

/**
 * GET /cards/creatAccountByCard - Cards page.
 * @param  {Object} res - Express Response Object
 * @param  {Object} card - Card Object
 * @param  {Function} next - Express Middleware Function
 */
exports.creatAccountByCard = (req, res, next) => {
   Card.findOne({ uid: req.params.id }).exec((err, card) =>{
    if (err) return next(err);

    //添加老会员账户学院信息
    User.findOne({email: card.qq+"@qq.com"})
    .exec((err, existingUser) =>{
      if (err) {return next(err);}

      existingUser.profile.profield = card.profield;
      existingUser.save((err) => {
        if (err) {return next(err);}
      });

      if (existingUser) {
        //会员卡绑定到老会员账户上
        Card.findOneAndUpdate({ uid: req.params.id }, {
          $set: {
            memberid: card.qq+"@qq.com",
          }
        }, (err) => {
          if (err) return next(err);
        });
        req.flash('success', { msg: 'update already exists.' });
        return res.redirect('/cards/');
      }
      // 根据会员卡创建账号
      // const user = new User({
      //   email: card.qq+"@qq.com",
      //   password: card.mobile,
      //   type:'account',
      //   profile:{name:card.name,level : "1",
      //     idcard : card.idcard,
      //     mobile : card.mobile,
      //     qq : card.qq,
      //     description : card.description,
      //     profield:card.profield}
      // });
      // user.save((err) => {
      //   if (err) { return next(err); }
      //   req.flash('success', { msg: 'account created successfully.' });
      //   return res.redirect('/cards/');
      // });
    });
  });
};



/**
 * Private render function - Card Detail
 * @param  {Object} res - Express Response Object
 * @param  {Object} card - Card Object
 * @param  {Object[]} locks - Array of all locks
 */
const renderDetail = (res, card, locks) => {
  res.render('card', {
    title: `Card: ${card.name}`,
    card,
    locks
  });
};

/**
 * GET /cards - Cards page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.index = (req, res, next) => {
  Card.find()
    .populate('locks')
    .exec((err, cards) => {
      if (err) return next(err);

      if (cards.length === 0) cards = null;

      res.render('cards', {
        title: 'Cards',
        cards
      });
    });
};

/**
 * GET /cards/:id - Card detail page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.showCard = (req, res, next) => {
  Card.findOne({ uid: req.params.id })
    .populate('locks')
    .exec((err, card) => {
      if (err) return next(err);

      Lock.find((err, locks) => {
        if (!card) {
          const newCard = new Card({
            uid: req.params.id,
            name: '',
            description: '',
            locks: []
          });

          newCard.save((err, card) => {
            if (err) return next(err);

            req.flash('success', { msg: 'Card created successfully.' });

            renderDetail(res, card, locks);
          });
        } else {
          // Create new Array of locks which can be modified
          let allLocks;
          let locksWithAssigned = locks;
          if (card.locks) {
            allLocks = locks.map(lock => Object.assign({}, lock._doc));
            locksWithAssigned = allLocks.map((lock) => {
              lock.assigned = !!card.locks.find(cardLock => cardLock.uid === lock.uid);
              return lock;
            });
          }

          renderDetail(res, card, locksWithAssigned);
        }
      });
    });
};


/**
 * POST /cards/:id - Card detail update.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.updateCard = (req, res, next) => {
  req.assert('name').notEmpty();

  Card.findOneAndUpdate({ uid: req.params.id }, {
    $set: {
      name: req.body.name,
      idcard: req.body.idcard,
      mobile: req.body.mobile,
      qq: req.body.qq,
      memberid: req.body.memberid,
      profield: req.body.profield,
      description: req.body.description,
      locks: req.body.locks || []
    }
  }, (err) => {
    if (err) return next(err);
    req.flash('success', { msg: 'Card updated successfully.' });
    res.redirect('/cards/findMyCards'+req.user.email);
  });
};

function deleteCard(req, res, next){
   Card.findOneAndRemove({ uid: req.params.id }, (err) => {
    if (err) return next(err);

    req.flash('success', { msg: 'Card deleted successfully.' });

  });
}
/**
 * GET /cards/delete/:id - Delete card
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.deleteCard = (req, res, next) => {
  deleteCard(req, res, next);
  res.redirect('/cards/');
};
exports.deleteCard2 = (req, res, next) => {
  deleteCard(req, res, next);
  res.redirect('/cards/findMyCards'+req.user.email);
};


/**
 * GET /cards/findMyCards - Cards page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.findMyCards = (req, res, next) => {
  Card.find({ memberid:req.params.email })
    .populate('locks')
    .exec((err, cards) => {
      if (err) return next(err);

      if (cards.length === 0) cards = null;

      //查看2分钟以内新卡刷卡记录，自助注册。
      var twominsago = new Date(new Date().getTime() - 1000*60*2);
      //console.log(new Date());
      //console.log(twominsago);
      //now2.setMinutes(now2.getMinutes()-2000);
        Log.find({new_card:true,createdAt:{$gte:twominsago}}).exec((err, logs) => {
          if (err) { return next(err); }
          // Reverse access log
      //    logs.reverse();
        //  if (logs.length === 0) logs = null;
        //鉴于安全性还没有考虑清楚，先讲logs设置为空，关闭查找最近log的自助注册功能。
          logs = null;
          //console.log(logs);
          res.render('myCards', {
            title: 'MyCards',
            cards:cards,
            logs:logs
          });

        });

    });
};
