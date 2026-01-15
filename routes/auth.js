const express = require('express');
const router = express.Router();
const { check, body, escape } =require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
    [
        body('email', 'Please enter a valid email')
        .isEmail()
        .custom((value, {req}) => {
            return User.findOne({ email: value}).then(userDoc=>{
                if(!userDoc) {
                    return Promise.reject(
                        "No user found with this email. Please pick a different one")
                }
            })
        })
        .normalizeEmail(),
        body('password', 'Please use password with only numbers text and special characters at least 8 characters long')
        .isLength({ min: 8 })
        .escape()
        .trim()
    ]
    , authController.postLogin);

router.post('/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req})=>{
            return User.findOne({ email: value }).then(userDoc=>{
                if(userDoc) {
                    return Promise.reject(
                        "Email exists already, please pick a different one")
                }
            })
        })
        .normalizeEmail(),
        body('password', 'Please use password with only numbers text and special characters at least 8 characters long')
        .isLength({ min: 8 })
        .escape()
        .trim(),
        body('confirmPassword')
        .custom((value, { req }) =>{
            if( value!= req.body.password ) {
                throw new Error("Passwords have to match! ");
            }
            return true;
        }).trim()
    ],
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;