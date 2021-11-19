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

async function main() {
  mongoose.set('useCreateIndex', true);
  mongoose.set('useNewUrlParser', true);
  console.log("Connecting to the database...");
  await mongoose.connect('mongodb://localhost/stats', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("Connected to database!");

  let courses = exportDataFromSpreadsheet();
  let results = [];

  for(key in courses) {
    let co = courses[key];

    let datesInDb = [];
    let newResults = [];
    let dbCourse = await Course.findOne({courseCode: co.courseCode}, {results: 1});

    if(dbCourse != null) {
      for(let i in dbCourse.results) {
        datesInDb.push(dbCourse.results[i].date);
      }

      newResults = dbCourse.results;
    } else {
      await Course.create(co);
    }
    
    
    console.log("COURSE: " + co.courseCode);
    //console.log(resultAlreadyInDb);

    let newEntry = false;

    for(let i in co.results) {
      if(datesInDb.indexOf(co.results[i].date) == -1) {
        console.log("NEW ENTRY: " + co.results[i].date);
        results.push(co.results[i]);

        newResults.push(co.results[i])

        newEntry = true;
      }
    }

    if(newEntry){

      await Course.updateOne({courseCode: co.courseCode}, {$set: {results: newResults}});
      console.log("Course " + co.courseCode + " updated.");
      
    }
  }

  if(results.length != 0) {
    Result.collection.insertMany(results, (err, r) => {
      Course.aggregate([
        { $addFields: {
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
        if(err1 != null) {
          console.log(err1);
        }
        Course.aggregate([
          { $addFields: { total: { $add: [{ $sum: '$results.U' }, '$totalPass'] },
            passRate: { $cond: [{ $eq: ['$totalPass', 0] }, 0, { $divide: ['$totalPass', { $add: ['$totalPass', { $sum: '$results.U' }] }] }] } } },
          { $out: 'courses' },
        ], (err2, result2) => {
          if(err2 != null) {
            console.log(err2);
          }
          console.log('Database updated!');
          process.exit();
        });
      });
    });
  }else {
    console.log("No new results added.")
  }
}

function exportDataFromSpreadsheet() {
  let courses = {};
  console.log('Reading spreadsheet...');
  const worksheet = xlsx.parse(`${__dirname}/${filename}`);
  worksheet.slice(1).forEach((ws) => {
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

  return courses;
}

main();

