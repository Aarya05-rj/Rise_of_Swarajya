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

// Duolingo-style quiz routes
router.get('/questions', quizController.getQuestions);
router.post('/submit-quiz', quizController.submitQuiz);
router.get('/progress/:userId', quizController.getProgress);

module.exports = router;
