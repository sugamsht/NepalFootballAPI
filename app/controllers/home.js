/*!
 * Module dependencies.
 */

exports.index = function (req, res) {
  res.render('home/index', {
    title: 'Node Express Mongoose Boilerplate'
  });
  // res.sendFile('/home/fon.html');
};

exports.login = function (req, res) {
  res.render('home/login', {
    title: 'login to mess things up'
  });
};

exports.live = function (req, res) {
  res.render('home/live', {
    title: 'login to mess things up'
  });
};

exports.settings = function (req, res) {
  res.render('home/settings', {
    title: 'Settings'
  });
};
