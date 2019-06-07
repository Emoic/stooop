const Project = require('../models/Project');
const Card = require('../models/Card');

/**
 * Log module.
 * @module controllers/projects
 */

/**
 * GET /projects - Projects page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.index = (req, res, next) => {
  Project.find((err, projects) => {
    if (err) return next(err);

    if (projects.length === 0) projects = null;

    res.render('projects', {
      title: 'Projects',
      projects
    });
  });
};

/**
 * GET /projects/findMyProject - Projects page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.findMyProjects = (req, res, next) => {
  Project.find({ userId:req.user._id }).exec((err, projects) => {
    if (err) return next(err);

    if (projects.length === 0) projects = null;

    res.render('projects', {
      title: 'Projects',
      projects
    });
  });
};

/**
 * GET /cards/:id - Card detail page.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.showProject = (req, res, next) => {
  Project.findOne({ uid: req.params.id }, (err, project) => {
    if (err) return next(err);

    Card.find({ projects: project._id }, (err, cards) => {
      if (err) return next(err);

      res.render('project', {
        title: `Project ${project.name}`,
        project,
        cards
      });
    });
  });
};

/**
 * POST /projects - Create new project.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.postProject = (req, res, next) => {
  req.assert('uid').notEmpty();
  req.assert('name').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/myProjects');
  }

  const project = new Project({
    uid: req.body.uid,
    userId:req.body.userId,
    name: req.body.name,
    url:req.body.url,
    description: req.body.description
  });

  Project.findOne({ uid: req.body.uid }, (err, existingProject) => {
    if (err) { return next(err); }
    if (existingProject) {
      req.flash('errors', { msg: 'This project already exists' });
      return res.redirect('/myProjects');
    }

    project.save((err) => {
      if (err) { return next(err); }

      req.flash('success', { msg: 'Project created successfully.' });

      res.redirect('/myProjects');
    });
  });
};




/**
 * POST /projects/:id - Project detail update.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.updateProject = (req, res, next) => {
  req.assert('name').notEmpty();

  Project.findOneAndUpdate({ uid: req.params.id }, {
    $set: {
      name: req.body.name,
      url: req.body.url,
      description: req.body.description
    }
  }, (err) => {
    if (err) return next(err);

    req.flash('success', { msg: 'Project updated successfully.' });

    res.redirect('/myProjects/');
  });
};


/**
 * GET /projects/delete/:id - Delete project.
 * @param  {Object} req - Express Request Object
 * @param  {Object} res - Express Response Object
 * @param  {Function} next - Express Middleware Function
 */
exports.deleteProject = (req, res, next) => {
  Project.findOneAndRemove({ uid: req.params.id }, (err) => {
    if (err) { return next(err); }

    req.flash('success', { msg: 'Project deleted successfully.' });

    res.redirect('/myProjects');
  });
};
