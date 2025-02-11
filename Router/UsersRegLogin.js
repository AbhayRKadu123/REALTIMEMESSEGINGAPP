
const express=require('express')
const Router=express.Router()
const passport = require('passport');
let WrapAsync=require('../WrapAsync')

let User=require('../Models/user')



Router.get("/login",(req,res)=>{
    res.render('UserRegistration/login.ejs')
})
Router.post("/login",passport.authenticate('local',{failureRedirect:'/user/login',failureFlash:'Invalid username or password'}),WrapAsync(async(req,res)=>{
    
req.flash('success','Logged in')
    
    res.redirect('/')

}))


Router.get("/signup",(req,res)=>{
    res.render('UserRegistration/SignUp.ejs')
})


Router.post("/signup",async (req, res, next) => {
    try{
        const { UserName, email, password } = req.body;

        // Create a new user object
        let NewUser = new User({ email: email, username: UserName });

        // Register the new user and handle the result
        let Result = await User.register(NewUser, password);

        console.log(Result); // You may want to remove this in production

        // Set flash message on successful sign-up
        req.flash('success', 'User signed up successfully.');

        // Log the user in after successful sign-up
        req.login(Result, (error) => {
          
            // Set flash message for successful login
            req.flash('info', 'User Registered');

            // Redirect to the homepage or another route upon successful login
        res.redirect('/');
        });}catch(err){
            req.flash('error',err.message)
            res.redirect('/user/signup')
        }



    } );



Router.get('/logout',WrapAsync(async(req,res)=>{
    req.logOut((err)=>{
        if(err){
            return err;
        }
    })
req.flash('success','User Logged Out')

    res.redirect('/user/login')
}))

module.exports=Router;