require('dotenv').config();
const path = require('path');
const fs = require('fs');
const cors = require("cors");

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const RateLimit = require("express-rate-limit");
const app = express();

const errorController = require('./controllers/error');
const User = require('./models/user');
const adminRoutes = require('./routes/admin');
const adminRoutesV2 = require('./routes/admin-v2');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20000
});

const corsOptions = {
  origin: "http://localhost:5173" // Replace with your actual front-end domain
};

app.use(cors(corsOptions));
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
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Multer middleware for file uploads - must come before routes
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));

app.use('/api/', adminRoutesV2);

app.use('/api', (error, req, res, next) => {
    res.status(error.httpStatusCode || 500).json({
        error: true,
        message: error.message || 'Internal Server Error'
    });
});

const csrfProtection = csrf();


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(limiter);



const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  // collection: 'sessions'
});


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
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a'}
)

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }))

app.use((req, res, next) => {
  res.locals.isAuthenticated = req?.session.isLoggedIn || true;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req?.session.user) {
    return next();
  }
  User.findById(req?.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    app.listen(process.env.PORT || 4000);
    
  })
  .catch(err => {
    console.log(err);
  });
app.use((error, req, res, next) => {
  res.status(500).render('500',{
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req?.session?.isLoggedIn || true
  })
});
app.use(errorController.get404);