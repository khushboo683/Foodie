const express=require('express');
const router=express.Router({mergeParams:true});
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Campground=require('../models/campground');
const Review = require('../models/review');
const {campgroundSchema,reviewSchema}=require('../schema');
const {isLoggedIn, validateCampground, isAuthor, validateReview, isReviewAuthor}=require('../middleware');
const reviews=require('../controllers/reviews');





router.post('/',isLoggedIn,validateReview,catchAsync(async (req,res)=>{
    const campground= await Campground.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
   await review.save();
    await campground.save();
    req.flash('success','Successfully added the review!');
    res.redirect(`/campgrounds/${campground._id}`);
// res.send('you made it');
}));
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{
    const {id, reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted the review!');
    res.redirect(`/campgrounds/${id}`);
    // res.send('DELETE ME!!');
}))

module.exports=router;