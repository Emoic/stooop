const Log = require('../models/Log');
const Card = require('../models/Card');//for resport

/**
 * Log module.
 * @module controllers/access-log
 */

/**
 * GET /access-log - Access Log page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.index = (req, res, next) => {
  Log.find((err, logs) => {
    if (err) { return next(err); }
    // Reverse access log
    logs.reverse();

    if (logs.length === 0) logs = null;
    console.log(logs);

    res.render('access-log', {
      title: 'Access Log',
      logs
    });
  });
};



/**
 * GET /access-log/:id - Card detail page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.showScore = (req, res, next) => {
  Log.findOne({_id:req.params.id}).exec(function(err, log){
      if (err) return next(err);
      console.log(log);
      res.render('score',{'log':log});
    });
};


/**
 * POST /log/:id - Log detail update.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.updateScore = (req, res, next) => {
  req.assert('score').notEmpty();

  Log.findOneAndUpdate({ _id: req.params.id }, {
    $set: {
      score: req.body.score,
      score_type: req.body.score_type,
      note: req.body.note
    }
  }, (err) => {
    if (err) return next(err);

    req.flash('success', { msg: 'Score updated successfully.' });

    res.redirect('/access-log/');
  });
};



/**
 * GET /score_report - Access Log page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.score_report = (req, res, next) => {

  Log.find({success:true}).
  where('score').gt(0).
  exec(function(err,logs){
    if (err) return next(err);
    // Reverse access log
    logs.reverse();
    Card.find().exec(function(err,cards){

    // console.log(cards);
  //   console.log(logs);

     cards.reverse();
     var report =new Array();
     for (var l in logs) {
       for (var c in cards) {
         if (logs[l].card_id == cards[c].uid ) {
           report.push({'card_id':cards[c].uid,'name':cards[c].name,'idcard':cards[c].idcard,'profield':cards[c].profield,'score':logs[l].score,'score_type':logs[l].score_type,'note':logs[l].note,'createdAt':logs[l].createdAt});
         }
       }
     }
     console.log(report);
     res.render('score_report', {
       title: 'Score Report',
       report
     });


    });

  });

};
