const mongoose = require('mongoose');
const xlsx = require('node-xlsx');
const Result = require('./models/Result');
const Course = require('./models/Course');

const courseProperties = [
  'courseCode',
  'courseName',
  'programShort',
  'programLong',
];
const filename = 'results.xlsx';
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://localhost/stats', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
let courses = {};
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Reading file..');
  const worksheet = xlsx.parse(`${__dirname}/${filename}`);
  worksheet.slice(1).forEach((ws) => {
    console.log(ws.name);
    const data = ws.data.slice(1);
    data.forEach((r) => {
      let courseCode, courseName, programShort, programLong, resultId, type, points, date, grade, count, fraction;
      [courseCode, courseName, programShort, programLong, resultId, type, points, date, grade, count, fraction] = r;
      if (date.toString().length === 5) { // Excel short date format
        date = (new Date((date - (25567 + 2)) * 24 * 60 * 60 * 1000)).toISOString().substr(0,10);
      } else {
        date = new Date(date+' 12:00').toISOString().substr(0,10);
      }
      if (!(courseCode in courses)) {
        let course = new Course();
        courseProperties.forEach((p, i) => {
          course[p] = r[i];
        });

        let result = new Result();
        result.date = date;
        result.type = type;
        result[grade] = count;
        course.results = [result];
        courses[courseCode] = course;
      } else {
        let course = courses[courseCode];
        let results = course.results;
        let result = results[results.length - 1];
        if (date === result.date) {
          result[grade] = count;
          course.results[course.results.length - 1] = result;
        } else {
          let result = new Result();
          result.date = date;
          result.type = type;
          result[grade] = count;
          course.results.push(result);
        }
        courses[courseCode] = course;
      }
    });
  });
  let wrapped = [];
  let results = [];
  for (let key in courses) {
    let co = courses[key];
    wrapped.push(co);
    co.results.forEach((result) => results.push(result));
  }
  Course.collection.insertMany(wrapped, (err, r) => {
    Result.collection.insertMany(results, (err, r) => {
      Course.aggregate([
        { $addFields: { totalFail: { $sum: '$results.U' },
          U: { $sum: '$results.U' },
          G: { $sum: '$results.G' },
          TG: { $sum: '$results.TG' },
          3: { $sum: '$results.3' },
          4: { $sum: '$results.4' },
          VG: { $sum: '$results.VG' },
          5: { $sum: '$results.5' },
          totalPass: { $cond: [{ $eq: [
            { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }] }, 0] }, { $add: [{ $sum: '$results.G' }, { $sum: 'results.TG' }]}, { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }, { $sum: '$results.TG' }] }]
          },
          averageGrade:
          { $cond: [{ $eq: [
            { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }] }, 0] }, 0,
            { $divide: [{ $sum: [
              { $multiply: [{ $sum: '$results.3' }, 3] },
              { $multiply: [{ $sum: '$results.4' }, 4] },
              { $multiply: [{ $sum: '$results.5' }, 5] },
            ] }, { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }] }] }] }
        } },
        { $out: 'courses' },
      ], (err1, result1) => {
        console.log(err1);
        Course.aggregate([
          { $addFields: { total: { $add: ['$totalFail', '$totalPass'] },
            passRate: { $cond: [{ $eq: ['$totalPass', 0] }, 0, { $divide: ['$totalPass', { $add: ['$totalPass', '$totalFail'] }] }] } } },
          { $out: 'courses' },
        ], (err2, result2) => {
          console.log(err2);
          console.log('Database updated');
          process.exit();
        });
      });
    });
  });
});
