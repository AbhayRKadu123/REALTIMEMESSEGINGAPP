let WrapAsync=(fn)=>{
    return async(req,res,next)=>{
    fn(req,res,next).catch((err)=>{
        req.flash("error", err.message|| "Something went wrong!");
        res.redirect("/");
        })
    }}

module.exports=WrapAsync