const Course = require('../models/Course');

exports.resultList = ((req, res) => {
  Course.aggregate([
    { $match: { courseCode: req.params.courseCode.toUpperCase() } },
    { $unwind: '$results' },
    { $replaceRoot: { newRoot: '$results' } },
    { $sort: { date: -1 } },
  ], (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

exports.courseDetail = ((req, res) => {
  Course.findOne({ courseCode: req.params.courseCode.toUpperCase() }, {results: 0}).exec((err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

exports.courseList = ((req, res) => {
  let sort = {};
  let items = 20;
  let page = 0;
  if (req.query.page) {
    page = parseInt(req.query.page);
  }
  if (req.query.items) {
    items = parseInt(req.query.items);
  }
  if (req.query.sort) {
    const sortingInstructions = req.query.sort.split('_');
    const dict = { asc: 1, desc: -1 };
    if (sortingInstructions.length > 1) {
      sort[sortingInstructions[0]] = dict[sortingInstructions[1]];
    } else {
      sort[sortingInstructions[0]] = -1;
    }
  }
  sort.total = -1;
  if (!('courseName' in sort)) {
    sort.courseName = -1;
  }
  let together = {}
  let findee = {};
  if (req.query.search) {
    findee.$regex = req.query.search;
    findee.$options = 'i';
    let matchee1 = {};
    let matchee2 = {};
    let matchee3 = {};
    matchee1.courseName = findee;
    matchee2.courseCode = findee;
    matchee3.programShort = findee;
    together.$or = [matchee1, matchee2, matchee3];
  }
  Course.aggregate([
    { $match: together },
    { $facet: {
      'courses': [ 
        { $project: { _id: 0, courseName: 1, courseCode: 1, totalPass: 1, totalFail: 1, programShort: 1, programLong: 1, passRate: 1, averageGrade: 1, total: 1 } },
        { $sort: sort },
        { $skip: page*items },
        { $limit: items }],
      'metadata': [ {$group:  {_id: null, count: { $sum: 1 } } }, {$project: {_id: 0} } ],
    } },
  ], (err, result) => {
    res.json(result[0]);
  });
});
