const Log = require('../models/Log');
const Card = require('../models/Card');

/**
 * API module.
 * @module controllers/api
 */

/**
 * Function for creating response objects
 * @param   {string} lockName - Name of the Lock
 * @param   {boolean} canAccess - Boolean indicating if card can access this Lock
 * @returns {Object}
 */
const makeResponseObject = (lockName, canAccess) => {
  const data = {};
  data[lockName] = canAccess === true;
  return data;
};

/**
 * GET /api/v1/access - Access API.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.index = (req, res, next) => {
  if (!req.query.lock) {
    const error = new Error('Missing required query parameter: "lock"');
    error.status = 400;
    return next(error);
  }

  if (!req.query.card) {
    const error = new Error('Missing required query parameter: "card"');
    error.status = 400;
    return next(error);
  }

  const lockId = req.query.lock;
  const cardId = req.query.card;
  //是否定时同步数据用的心跳数据，y的话，只返回结果，不记录log。
  const issync = req.query.issync;

  Card.findOne({ uid: cardId })
    .populate('locks')
    .exec((err, card) => {
      if (err) { return next(err); }

      // If card is not in system, return false answer
      if (!card) {
        // Create log information
        const log = new Log({
          lock_id: lockId,
          card_id: cardId,
          success: false,
          new_card: true
        });

        // Save log information
        log.save(err => next(err));

        // Return false answer
        return res.json(makeResponseObject(lockId, false));
      }

      // Check if card can access requested lock
      //const canAccess = !!card.locks.find(lock => lock.uid === lockId);
      //除了检查锁的权限外，增加一个选项，卡是否通过审核。
      const canAccess = !!card.locks.find(lock => lock.uid === lockId)&&card.checked;
      // Create log information
      const log = new Log({
        lock_id: lockId,
        card_id: cardId,
        card_name:card.name,//将card的name记录的网站中，方便查看
        success: canAccess,
        new_card: false
      });

      // Save log information,如果不是门锁自动的同步请求的话。
      if('y' != issync){
        log.save(err => next(err));
      }

      // Return answer
      res.json(makeResponseObject(lockId, canAccess));
    });
};
