const express = require('express');
const router = express.Router();
const { check, body } =require('express-validator');

const authController = require('../controllers/auth-v2');
const User = require('../models/user');

router.get('/login', authController.getLoginV2);

router.get('/signup', authController.getSignupV2);

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
    , authController.postLoginV2);

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
    authController.postSignupV2);

router.post('/logout', authController.postLogoutV2);

router.get('/reset', authController.getResetV2);

router.post('/reset', authController.postResetV2);

router.get('/reset/:token', authController.getNewPasswordV2);

router.post('/new-password', authController.postNewPasswordV2);

module.exports = router;