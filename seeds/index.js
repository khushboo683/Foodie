const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// });
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
console.log('connection open');
})
.catch((er)=>{
console.log('error');
})

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'618628256d22294d6a690fc4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            
            description:"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolor, iusto exercitationem magnam illum suscipit architecto, ratione perferendis atque rem veniam voluptatem aspernatur. Laboriosam, ipsum quae voluptates explicabo necessitatibus saepe cumque.",
            price:price,
            geometry:{
                   type:"Point",
                   coordinates:[
                     cities[random1000].longitude,
                     cities[random1000].latitude
                   ]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dev-homoeo-hall/image/upload/v1636275383/yelpcamp/nqbrphxuaojhnt5ndqno.jpg',
                  filename: 'yelpcamp/nqbrphxuaojhnt5ndqno',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dev-homoeo-hall/image/upload/v1636275401/yelpcamp/eyhzwt9fuv97wrqou8gb.jpg',
                  filename: 'yelpcamp/eyhzwt9fuv97wrqou8gb',
                
                }
              ]
        
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})