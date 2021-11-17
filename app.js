if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
// mongodb+srv://khushboo_dev:<password>@cluster1.qnl7f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

const express=require('express');
const app=express();
const path=require('path');
const bodyParser=require('body-parser');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const Campground=require('./models/campground');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const Review=require('./models/review');
const User=require('./models/user');
const {campgroundSchema,reviewSchema}=require('./schema.js');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const mongoose=require('mongoose');
const review = require('./models/review');
const campgroundRoutes=require('./routes/campground');
const reviewRoutes=require('./routes/review')
const userRoutes=require('./routes/user');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const MongoStore=require('connect-mongo');
// const dbUrl=process.env.DB_URL;
// mongoose.connect('mongodb://localhost:27017/yelp-camp',{
//     useNewUrlParser:true,
//     useCreateIndex:true,
//     useUnifiedTopology:true
// });
// process.env.DB_URL ||
const dbUrl=  process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// mongoose.connect(dbUrl)
// .then(()=>{
// console.log('connection open');
// })
// .catch((er)=>{
// console.log('error');
// })
// const db=mongoose.connection;
// db.on("error",console.error.bind(console,"connection error:"));
// db.once("open",()=>{
//     console.log("Database connected");
// });
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'));
// app.use((req,res,next)=>{
//     res.locals.messages=req.flash('success');
//     next();
// })

app.use(express.static(path.join(__dirname,'public')));

// const store=new MongoStore({
//     url:dbUrl,
//     
//     touchAfter: 24*60*60
// })

// store.on("error",function(e){
//     console.log('session store error',e);
// })
const secret= process.env.SECRET || 'thisisasecret';
const sessionConfig={
    store: MongoStore.create({
        mongoUrl: dbUrl,
        secret:secret,
        touchAfter: 24*60*60
    }),
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now()*1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
// app.use((req,res,next)=>{
//     res.locals.success=req.flash('success');
//     next();
// })

app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy:false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    // console.log(req.session);
    console.log(req.query);
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.get('/fakeUser',async(req,res)=>{
    const user= new User({email:'khushboodev@gmail.com',username:'khushboolakshya'});
    const newUser=await User.register(user,'kitty');
    res.send(newUser);
})
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);
app.use('/',userRoutes);

app.get('/',(req,res)=>{
    res.render('home');
})
// app.get('/campgrounds/search/:name', (req, res) => {

//     const regex=new RegExp(req.params.name,'i');
//     Campground.find({title:regex}).then((result)=>{
// console.log(result);
// if(result.length){
//     res.render('/campgrounds/searchResults',{result});
// }
// else {
//     req.flash('error','Sorry, cannot find that eatery!');
//     res.redirect('/campgrounds');
// }
//     }) 
//   });


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found !',404));
})
app.use((err,req,res,next)=>{
    const{statusCode=500}=err;
    if(!err.message)err.message='Something went wrong !';
    res.status(statusCode).render('error',{err});
});


const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`serving from port ${port}`);
})