const express=require('express');
const router=express.Router();
const flash=require('connect-flash');
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Campground=require('../models/campground');
const {campgroundSchema}=require('../schema');
const {isLoggedIn, validateCampground, isAuthor}=require('../middleware');
const campgrounds=require('../controllers/campgrounds');
const {storage}=require('../cloudinary');
const multer=require('multer');
const upload=multer({storage});


router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));
// .post(upload.single('image'),(req,res)=>{
// console.log(req.body, req.file);
// res.send('It worked!');
// })
router.get('/new',isLoggedIn,campgrounds.renderNewForm);
router.get('/searchResults',isLoggedIn,campgrounds.renderSearchResults);

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));


module.exports=router;