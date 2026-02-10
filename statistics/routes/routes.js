const express = require('express');
const courseController = require('../controller/courseController.js');

const router = express.Router();

router.get('/courses/', courseController.courseList);
router.get('/courses/:courseCode/', courseController.courseDetail);
router.get('/results/:courseCode/', courseController.resultList);
router.get('/latestUpdate/', courseController.latestUpdate);
module.exports = router;
