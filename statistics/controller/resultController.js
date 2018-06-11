const Result = require('../models/Result.js');

    // { $project: { _id: '$date', 3: '$date', 4: '$count' 5: } },
    // { $group: { _id: '$name',  } },
exports.resultList = ((req, res) => {
  Result.aggregate([
    { $match: { courseCode: req.params.courseCode.toUpperCase() } },
    { $project: { date: 1, grade: 1, count: 1 } },
    { $group: { _id: '$date', 3: { $sum: '$count' } } },
    { $sort: { _id: 1 } },
  ], (err, result) => {
    if (err) {
      res.json('');
    } else {
      res.json(result);
    }
  });
});
