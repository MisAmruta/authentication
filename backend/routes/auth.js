const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const router = express.Router()
const User = mongoose.model('User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {JWT_TOKEN} = require('../Keys')
const requirelogin = require('../middleware/requirelogin')

router.get('/details',requirelogin,(req,res)=>{
    User.find().select('-password').then(data=>{
        res.status(200).json(data)
    })
})

router.post('/signup',(req,res)=>{
    const {name,email,password} = req.body
    if(!name || !email || !password){

        return res.status(404).json({error:"Please fill up all fields"})
    }
    User.findOne({email:email}).then(data=>{
        if(data){
          return  res.json({error:"user already exists"})
        }
        bcrypt.hash(password,12).then(hashPassword=>{

            const user = new User({
                name,
                email,
                password:hashPassword
            })

            user.save().then(savedUser=>{

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: '',
                        pass: ''
                    }
                });
 
                var mailOptions = {
                    from: '',
                    to: savedUser.email,
                    subject: 'Welcome to the clube ' + savedUser.name,
                    text: 'This is just for testing purpose!!!'
                };
 
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                res.status(200).json({message:"signup sucessful"})

            }) .catch(err=>{
                console.log(err)
            })
            
        })
       
        
    })
    
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body 
    if(!email || !password){
        return res.status(404).json({error:"please fill up all fields"})
    }
    User.findOne({email:email}).then((savedUser)=>{
        if(!savedUser){
           return res.status(404).json({error:"Invalid email or password"})
            // email checking
        }
        bcrypt.compare(password,savedUser.password).then(data=>{
            if(!data){
                return res.status(404).json({error:"Invalid email or password"}) // passowrd checking
            }
        else{
            const token = jwt.sign({_id:data._id},JWT_TOKEN)
             res.status(200).json({token,message:"Login successful",user:savedUser})
        }
        }) .catch(err=>{
            console.log(err)
        })
            
    }) .catch(err=>{
        console.log(err)
    })
})



module.exports = router