let WrapAsync=(fn)=>{
    return async(req,res,next)=>{
    fn(req,res,next).catch((err)=>{
        console.log(err)
             next(err)
        })
    }}

module.exports=WrapAsync