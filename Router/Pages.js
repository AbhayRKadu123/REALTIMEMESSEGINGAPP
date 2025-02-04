const express=require('express')
let WrapAsync=require('../WrapAsync')
const Router=express.Router()
let User=require('../Models/user')
let ChatRoom = require('../Models/Room');
let Message=require('../Models/Messages')

const isAuthenticated = require('../IsAuthenticated');


Router.get("/", isAuthenticated, WrapAsync(async(req, res) => {
    console.log('Username = ' + req.user._id);
    let Result = await ChatRoom.find({ users: { $in: [req.user._id] } });
    res.render('pages/HomePage.ejs',{Result});
}));

// Message page (authenticated)
Router.get("/MessagePage", isAuthenticated, WrapAsync(async(req, res) => {
    let {RName}=req.query;
  
    console.log('Name from query'+req.user)
res.locals.User=req.user;
let RoomName=RName;
res.locals.Room=RoomName;
let MessageData = await Message.find({room:RoomName}).populate('sender');

    console.log('MessageData=='+MessageData)
    res.render('pages/MessagePage.ejs',{MessageData});


}));

// Create room page (authenticated)
Router.get("/createRoom", isAuthenticated, WrapAsync(async(req, res) => {
    res.render('pages/CreateRoom.ejs');
}));
Router.post("/createRoom", isAuthenticated, WrapAsync(async(req, res) => {
    console.log(req.body);
    console.log('--------------', req.user);
    // Ensure req.user is valid
  

    // Add the user to the users array in the new room
    let arr = [req.user._id]; // Push the user ID (assuming req.user has _id field)

    let { RoomName } = req.body;
    let RoomExist=await ChatRoom.find({name:RoomName});
    

    
    console.log(typeof RoomName)
    if(RoomExist.length>0 && RoomExist[0].name==RoomName){
        req.flash('msg','RoomName Already Registered')
        res.redirect('/createRoom');

    }else{
        let NewRoom = new ChatRoom({ name: RoomName, users: arr });
        let Res = await NewRoom.save();
        console.log(Res);
       req.session.RoomName=Res.name;
       req.flash('success','New Room Created!')

        res.redirect(`/MessagePage?RName=${Res.name}`);
    }
    
    
   
}));
Router.get("/SeeExistingRoom",isAuthenticated,WrapAsync(async(req,res)=>{
    let Result = await ChatRoom.find({ users: { $nin: [req.user._id] } });

    console.log(Result)
    res.render("pages/SeeExistingRoom.ejs",{Result})
}));
Router.put("/JoinExistingRoom/:id",isAuthenticated,WrapAsync(async(req,res)=>{
let {id}=req.params
console.log('ID='+id)
let result=await ChatRoom.findByIdAndUpdate(id,{$push:{users:req.user._id}},{ new: true });
// req.session.RoomName=result.name;

req.flash('msg',`congratulation you are member of  ${result.name} `)


    res.redirect(`/MessagePage?RName=${result.name}`)
}))


Router.put('/MessagePage/Delete/:RoomName/:UserName',isAuthenticated,WrapAsync(async(req,res)=>{
let {RoomName,UserName}=req.params;
await Message.deleteMany({room:RoomName,sender:req.user._id});

let result=await ChatRoom.updateOne({name:RoomName},{$pull:{users:req.user._id}});
req.flash('success','Room Deleted SuccessFully')
    res.redirect('/')
}))

module.exports=Router;
