const {JWT_TOKEN } = require('../Keys')
const jwt = require('jsonwebtoken')

module.exports=(req,res,next)=>{
    const {authorization} = req.headers

    if(!authorization){
        return res.status(404).json({error:"you must login first.."})
    }else{
        const token = authorization.replace("Bearer ","")
        jwt.verify(token,JWT_TOKEN,(err,data)=>{
            if(err){
                return res.status(404).json({error:"unauthorized user"})
            }
            next()
        })
    }
}