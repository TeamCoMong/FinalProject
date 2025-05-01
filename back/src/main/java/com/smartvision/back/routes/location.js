const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 사용자 위치 업로드
router.post('/user', locationController.uploadUserLocation);

// 보호자가 사용자 위치 조회
router.get('/user', locationController.getUserLocation);

module.exports = router;