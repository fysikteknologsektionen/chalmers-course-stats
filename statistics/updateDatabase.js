/*
This file updates the database with all the results of the documents listen in result_files.json.
This script will work for both updating a existing database and for creating a new one.
*/
require('dotenv').config({ path: `${__dirname}/../.env` });
var fs = require('fs');
var resultsJson = JSON.parse(fs.readFileSync(`${__dirname}/result_files.json`, 'utf8'));

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


function exportDataFromAllSpreadsheets() {
    var courses = {};

    for (i in resultsJson) {
        fileJson = resultsJson[i];

        if (!fileJson.exampleFile) {
            courses = exportDataFromSingleSpreadsheet(fileJson.filePath, fileJson.format, courses);
        }
    }
    return courses;
}

function exportDataFromSingleSpreadsheet(path, format, courses) {

    console.log(`Reading spreadsheet ${__dirname}/${path}...`);
    const worksheet = xlsx.parse(`${__dirname}/${path}`);

    //Depending on the format of the document, slice away the first worksheet.
    worksheet.slice(format).forEach((ws) => {

        const data = ws.data.slice(1);
        //For each row in the data from the 2nd onwards
        data.forEach((r) => {
            //Course Code, Course Name, ex: TKTFY, ex: Teknisk Fysik, Examination ID number, Type of examination, Course examination moment HP, date, grade, amount, fraction of total 
            let courseCode, courseName, programShort, programLong, resultId, type, points, date, grade, count, fraction;
            [courseCode, courseName, programShort, programLong, resultId, type, points, date, grade, count, fraction] = r;

            if(courseCode === undefined) {
                return;
            }

            if(courseCode.length != 6) {
                return;
            }
            if (date.toString().length === 5) { // Excel short date format
                date = (new Date((date - (25567 + 2)) * 24 * 60 * 60 * 1000)).toISOString().substr(0, 10);
            } else {
                date = new Date(date + ' 12:00').toISOString().substr(0, 10);
            }

            if (!(courseCode in courses)) { //If a row with a new course appears
                let course = new Course();
                courseProperties.forEach((p, i) => {
                    course[p] = r[i];
                });

                let result = new Result();
                result.resultId = resultId;
                result.date = date;
                result.type = type;
                result[grade] = count;
                course.results = [result];
                courses[courseCode] = course;
            } else { //A row with a previously seen course appears
                let course = courses[courseCode];
                let results = course.results;
                let result = results[results.length - 1];
                if (date === result.date) {
                    result[grade] = count;
                    course.results[course.results.length - 1] = result;
                } else {
                    let result = new Result();
                    result.resultId = resultId;
                    result.date = date;
                    result.type = type;
                    result[grade] = count;
                    course.results.push(result);
                }
                courses[courseCode] = course;
            }
        });
    });

    return courses
}

//Main Async function
async function main() {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useNewUrlParser', true);
    console.log("Connecting to the database...");
    const dbURI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
    await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to database!");

    if (process.argv.includes('--drop')) {
        await mongoose.connection.db.dropDatabase();
        console.log("Dropped the database.");
        process.exit();
    }

    let courses = exportDataFromAllSpreadsheets();
    let results = [];
    let verbose = process.argv.includes('--verbose')

    //Loop through all the courses in the datasheet one by one.
    for (key in courses) {
        let co = courses[key];
        let resultsInDb = [];
        let updatedResults = [];
        //Try to find that course in the database by its course code.
        let dbCourse = await Course.findOne({ courseCode: co.courseCode }, { results: 1 });

        if (dbCourse != null) {
            for (let i in dbCourse.results) {
                //Check what exams are already in the databse (no need to add them again).

                resultsInDb.push(dbCourse.results[i].date);
            }
            //Add all the existing results to a array of updated results. Any new results will be appended to this one.
            updatedResults = dbCourse.results;
        } else { //If the course does not yet exist in the database add it!
            console.log("Creating a new course: " + co.courseCode);
            await Course.create(co);
        }

        
        if(verbose){
            console.log("Checking course: " + co.courseCode);
            //console.log(resultAlreadyInDb);
        }

        let newEntry = false;
        

        for (let i in co.results) { //For each result of a course in spreadsheet
            if (resultsInDb.indexOf(co.results[i].date) == -1) { //If it does not exist in the database already
                if(verbose) {
                    console.log("NEW ENTRY: " + co.results[i].date);
                }
                results.push(co.results[i]); //Add it to the array of results being added

                updatedResults.push(co.results[i]); //Add it to the array of updated results.

                newEntry = true;
            }
        }

        if (newEntry) {//If there is at least one new result of any given course.
            //Update the results of a course entry in the database.
            await Course.updateOne({ courseCode: co.courseCode }, { $set: { results: updatedResults, updatedAt: Date.now() } });
            if(verbose) {
                console.log("Course " + co.courseCode + " updated.");
            }

        }
    }

    if (results.length != 0) {
        //Insert the new results into the database.
        Result.collection.insertMany(results, (err, r) => {
            Course.aggregate([
                {
                    $addFields: {
                        U: { $sum: '$results.U' },
                        G: { $sum: '$results.G' },
                        TG: { $sum: '$results.TG' },
                        3: { $sum: '$results.3' },
                        4: { $sum: '$results.4' },
                        VG: { $sum: '$results.VG' },
                        5: { $sum: '$results.5' },
                        totalPass: {
                            $cond: [{
                                $eq: [
                                    { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }] }, 0]
                            }, { $add: [{ $sum: '$results.G' }, { $sum: 'results.TG' }] }, { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }, { $sum: '$results.TG' }] }]
                        },
                        averageGrade:
                        {
                            $cond: [{
                                $eq: [
                                    { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }] }, 0]
                            }, 0,
                            {
                                $divide: [{
                                    $sum: [
                                        { $multiply: [{ $sum: '$results.3' }, 3] },
                                        { $multiply: [{ $sum: '$results.4' }, 4] },
                                        { $multiply: [{ $sum: '$results.5' }, 5] },
                                    ]
                                }, { $add: [{ $sum: '$results.3' }, { $sum: '$results.4' }, { $sum: '$results.5' }] }]
                            }]
                        }
                    }
                },
                { $out: 'courses' },
            ], (err1, result1) => {
                if (err1 != null) {
                    console.log("First error: ");
                    console.log(err1);
                }
                Course.aggregate([
                    {
                        $addFields: {
                            total: { $add: [{ $sum: '$results.U' }, '$totalPass'] },
                            passRate: { $cond: [{ $eq: ['$totalPass', 0] }, 0, { $divide: ['$totalPass', { $add: ['$totalPass', { $sum: '$results.U' }] }] }] }
                        }
                    },
                    { $out: 'courses' },
                ], (err2, result2) => {
                    if (err2 != null) {
                        console.log("Second error: ");
                        console.log(err2);
                    }
                    console.log('Database updated!');
                    process.exit();
                });
            });
        });

    } else {
        console.log("No new results added.")
        process.exit();
    }
}


main();

