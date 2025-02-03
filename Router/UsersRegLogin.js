
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
    res.render('UserRegistration/signup.ejs')
})
Router.post("/signup",WrapAsync(async(req,res)=>{
    let { UserName, email, password }=req.body;
let NewUser=new User({email:email,username:UserName})
let Result=await User.register(NewUser,password);
console.log(Result)
req.flash('success','UserSigned Up successfully..')
req.login(Result, (error) => {
    if (error) {
      return next(error); // Pass the error to error-handling middleware
    }
    // Redirect to the admin page upon successful login
    req.flash('info', 'User Registered')
    return  res.redirect('/');
  });
   
}))


Router.get('/logout',(req,res)=>{
    req.logOut((err)=>{
        if(err){
            return err;
        }
    })
req.flash('success','User Logged Out')

    res.redirect('/user/login')
})

module.exports=Router;