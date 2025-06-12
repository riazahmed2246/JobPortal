const interviewData = require('../data/interviewData.json');

exports.renderToolkit = (req, res) => {
  res.render('interviewToolkit', {
    videos: interviewData.videos,
    roles: Object.keys(interviewData.questions),
    companies: Object.keys(interviewData.tips)
  });
};

exports.getQuestions = (req, res) => {
  const role = req.params.role;
  const questions = interviewData.questions[role] || [];
  res.json({ role, questions });
};

exports.getTips = (req, res) => {
  const company = req.params.company;
  const tips = interviewData.tips[company] || [];
  res.json({ company, tips });
};
