const express = require('express');
const courseController = require('../controller/courseController.js');
const cache = require('express-redis-cache')();

const router = express.Router();

router.get('/courses/', cache.route(), courseController.courseList);
router.get('/courses/:courseCode/', courseController.courseDetail);
router.get('/results/:courseCode/', courseController.resultList);
module.exports = router;
