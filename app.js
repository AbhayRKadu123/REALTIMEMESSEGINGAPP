require('dotenv').config();
const MONGO_URI = process.env.mongoUrl
const express = require('express');
const app = express();
const session = require('express-session');
const engine = require('ejs-mate');
const passport = require('passport');
const path = require('path');
const localStrategy = require('passport-local');
const { urlencoded } = require('body-parser');
const User = require('./Models/user');
const isAuthenticated = require('./IsAuthenticated');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
var flash=require('connect-flash')
let ChatRoom = require('./Models/Room');
app.use(methodOverride('_method'));
app.use(flash())
// Set up ejs view engine
app.set('view engine', 'ejs');
app.engine('ejs', engine);
let Message=require('./Models/Messages')
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// Set up session handling
app.use(session({
    secret:  process.env.secret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.mongoUrl, // MongoDB connection string from .env
        collectionName: 'sessions', // Optional: Customize the collection name
        ttl: 24 * 60 * 60 // Optional: Session expiration time (24 hours)
      }),
    cookie: { secure:false ,
        maxAge: 24 * 60 * 60 * 1000
    }
  }))

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Set up body parser for urlencoded data
app.use(urlencoded({ extended: true }));

// Set up passport local strategy for authentication
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Use routers for user-related routes
let UserLoginReg = require('./Router/UsersRegLogin');
let Pages=require('./Router/Pages')


const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
let ActiveUsers={};
app.use((req,res,next)=>{
res.locals.msg=req.flash('msg')
res.locals.error=req.flash('error')
res.locals.success=req.flash('success')

res.locals.User=req.user;
    
    next()
})
io.on("connection", (socket) => {
    console.log('user connected for communication: ' + socket.id);
  
    socket.on('joinroom', (Room) => {
        let { ActiveUser, room } = Room;
        socket.on('isTyping',(msg)=>{
            console.log(msg)
            io.emit('istypingindicator',{Newmsg:msg,Newroom:room})
        })
        
        
        if (!ActiveUsers[socket.id]) {
            socket.join(room);
            ActiveUsers[socket.id] = { User: ActiveUser, Room: room };
            io.emit('ActiveUserLst', ActiveUsers);
        } else {
            console.log('User already connected:', socket.id);
        }

        // Handle client messages
        socket.on('clientmsg', async (msg) => {
            let { UserName, Sender, Msg } = msg;
            console.log(msg);
            socket.to(room).emit('msg', msg);

            // Save the message to the database
            let Mgs = new Message({ sender: Sender, room: room, content: Msg });
            await Mgs.save();
        });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        // Ensure the user exists in ActiveUsers before removing
        if (ActiveUsers[socket.id]) {
            // Remove user from ActiveUsers
            delete ActiveUsers[socket.id];

            // Emit updated inactive user list
            io.emit('DeActiveUserLst', ActiveUsers);
        }

        console.log('user Disconnected: ' + socket.id);
    });
});
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
//     content: { type: String, required: true },
httpServer.listen(process.env.localhost,()=>{
    console.log('listeningss')
});

app.use('/', Pages);

app.use('/user', UserLoginReg);


app.use((req,res,next)=>{
    req.flash('error', 'Page not found')

    res.redirect('/')
})

app.use((err,req,res,next)=>{
    req.flash('error',err)
    console.log(err)
    res.redirect('/')
})
