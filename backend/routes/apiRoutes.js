const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const quizController = require('../controllers/quizController');

router.get('/forts', dataController.getForts);
router.get('/characters', dataController.getCharacters);
router.get('/powadas', dataController.getPowadas);
router.get('/profile/:id', dataController.getProfile);
router.post('/profile/:id', dataController.updateProfile);
router.post('/update-score', dataController.updateScore);

// Activity tracking routes
router.get('/activities/:id', dataController.getActivities);
router.post('/activities', dataController.logActivity);
router.post('/log-activity', dataController.logActivity);

// Quiz App routes
router.get('/levels', quizController.getLevels);
router.get('/quizzes/:levelId', quizController.getQuizzes);
router.get('/questions/:quizId', quizController.getQuestions);
router.get('/questions', quizController.getQuestions);
router.post('/submit-quiz', quizController.submitQuiz);
router.get('/quiz-history/:userId/:quizId', quizController.getQuizHistory);
router.get('/quiz-history/:userId', quizController.getQuizHistory);
router.get('/user-stats/:userId', quizController.getUserStats);
router.get('/progress/:userId', quizController.getProgress);
router.get('/user-progress', quizController.getProgress);

module.exports = router;
