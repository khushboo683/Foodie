
const Campground=require('../models/campground');
const {cloudinary}=require('../cloudinary');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});

module.exports.index=async (req,res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground=async (req,res,next)=>{
 const geoData=await geocoder.forwardGeocode({
     query: req.body.campground.location,
     limit:1
 }).send()
// res.send(geoData.body.features[0].geometry);
    
    const campground= new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.images=req.files.map(f=>({url:f.path, filename:f.filename}));
    campground.author=req.user._id;
    console.log(campground);
         await campground.save();
          req.flash('success','Successfully made a new campground');
         res.redirect(`/campgrounds/${campground._id}`);
    
 
 }
 module.exports.renderSearchResults=(req,res,next)=>{
    const regex=new RegExp(req.query.query,'i');
        Campground.find({title:regex}).then((result)=>{
    console.log(result);
    if(result.length){
        
        res.render('campgrounds/searchResults',{result});
        req.flash('success','Here are the best matches of your result!');
    }
    else {
        req.flash('error','Sorry, cannot find that eatery!');
        res.redirect('/campgrounds');
    }
        }) 
 }

 module.exports.showCampground=async (req,res)=>{
    
    const campground= await Campground.findById(req.params.id).populate({path:'reviews',populate:{path:'author'}}).populate('author');
    //  console.log(campground);
    if(!campground){
        req.flash('error','Sorry, cannot find that campground!');
    return res.redirect('/campgrounds');
    }
    // console.log(campground);
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    const campground= await Campground.findById(id);
    if(!campground){
        req.flash('error','Sorry, cannot find that campground!');
    return res.redirect('/campgrounds');
    }
   
    res.render('campgrounds/edit',{campground});
}
module.exports.updateCampground=async (req,res)=>{
    const {id}= req.params;
    console.log(req.body);
    const campground= await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path, filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages)
    {
        for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename);
        }
       await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
    }
req.flash('success','Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteCampground=async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted the campground!');
    res.redirect('/campgrounds');
}
// module.exports.searchCampground=async(req,res)=>{
//     const {searchTerm}=req.query;
//     const campground=await Campground.find({title:searchTerm});
//     if(!campground){
//         req.flash('error','Sorry, cannot find that eatery!');
//     return res.redirect('/campgrounds');
//     }
   
//     res.redirect(`/campgrounds/${campground._id}`);

// }