module.exports=(req,res,next)=>{
    if (req.isAuthenticated()) {
        next()
    } else {
        req.flash('error','SomeThing Went wrong')
        res.redirect("/user/login");
    }
}