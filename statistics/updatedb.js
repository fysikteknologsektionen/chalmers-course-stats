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
let courses = {};
module.exports = () => {
  mongoose.connect('mongodb://localhost/test');
  const filename = 'Statistik_over_kursresultat.xlsx';
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    const worksheet = xlsx.parse(`${__dirname}/${filename}`);
    worksheet.slice(1).forEach((ws) => {
      const data = ws.data.slice(1);
      data.forEach((r) => {
        let courseCode, courseName, programShort, programLong, resultId, type, points, date, grade, count, fraction;
        [courseCode, courseName, programShort, programLong, resultId, type, points, date, grade, count, fraction] = r;
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
    for (let key in courses) {
      // console.log(key);
      wrapped.push(courses[key]);
    }
    Course.collection.insertMany(wrapped, (err, r) => console.log('Database updated'));
  });
};

