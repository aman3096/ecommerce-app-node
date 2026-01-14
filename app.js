require('dotenv');
const path = require('path');
const fs = require('fs');

const cors = require("cors");
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const https = require('https');

const errorController = require('./controllers/error');
const User = require('./models/user');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


const corsOptions = {
  origin: "http://localhost:3000" // Replace with your actual front-end domain
};
const MONGODB_REVISED_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.ds1gfe6.mongodb.net/${process.env.MONGODB_COLLECTION}?w=majority`

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_REVISED_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
  destination: (req,file, cb) =>{
    cb(null, 'images');
  },
  filename: (req, file, cb) =>{
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  if(file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
    cb(null, true);
  }
  cb(null, false);
}

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));

app.use(express.json());
app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});


app.use((error, req, res, next) => {
  // res.redirect('/500');
  res.status(500).render('500',{
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  })
});
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a'}
)

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }))



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500)
app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_REVISED_URI, { useNewUrlParser: true }
  )
  .then(result => {
    // https.createServer({ key: privateKey, cert: certificate },app).listen(process.env.APP_PORT|| 4000);
    app.createServer(process.env.PORT || 4000);
  })
  .catch(err => {
    console.log(err);
  });


