export const index = (req, res) => {
  res.render('home/index', {
    title: 'Node Express Mongoose Boilerplate'
  });
};

export const login = (req, res) => {
  res.render('home/login', {
    title: 'login to mess things up'
  });
};

export const live = (req, res) => {
  res.render('home/live', {
    title: 'login to mess things up'
  });
};

export const settings = (req, res) => {
  res.render('home/settings', {
    title: 'Settings'
  });
};