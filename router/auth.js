const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('cross-fetch');
router.use(bodyParser.urlencoded({extended: false}));
const Volunteer = require('../db/model/volunteerSchema.js')
const Ambulance = require('../db/model/Ambulance.js');
const Beds = require('../db/model/beds.js')
const Doctor = require('../db/model/Doctor.js')
const Food = require('../db/model/food.js')
const Helpline = require('../db/model/Helpline.js');
const Medicine = require('../db/model/medicine.js');
const Oxygen = require('../db/model/oxygen.js');
const Plasma = require('../db/model/plasma.js');
const Testing = require('../db/model/testing.js');
require('../db/conn.js');
router.use(express.json())




router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });


router.get('/', (req, res)=>{
    res.render('overall_services');
})
router.post('/signup', async (req, res)=>{
    var {name, email, username, password, contact, address} = req.body;
    password = await bcrypt.hash(password,10);
    if(!name || !email || !username || !password || !contact || !address)
    {
        return res.status(422).json({message: 'Please Fill all the fields'});
    }
    var user = await Volunteer.findOne({username: username});
    if(user)
    {
                 return res.status(422).json({message: 'Username already taken'});
    }
    else
    {
        var temp = new Volunteer({name, email, username, password, contact, address, admin: 'false', isVerified: 'false', date: new Date().toLocaleDateString()});
        temp.save().then(()=>{
            res.status(201).json({message: 'User Successfully Registered, please login'});
        }).catch((error)=>{
            return res.status(500).json({message: 'Database Error, contact kryptonites.ju@gmail.com'})
        })
    }
    
   
    
})
router.post('/login', async (req,res)=>{
  var {username, password} = req.body;
  
  if(!username || !password)
    {
        return res.status(422).json({message: 'Please Fill all the fields'});
    }
   let user = await Volunteer.findOne({username: username})

   if(user)
   {
         
         let isMatch = await bcrypt.compare(password, user.password)
         if(!isMatch)
         {
                      res.status(400).json({message:'Invalid Username or Password'});
         }
         else
         { 
             res.redirect('/index');

         }
   } 
   else
   {
       res.status(422).json({message: 'User is not registered'});
   }



  
})
router.get('/admin/accept/:id', async (req, res)=>{
    let id = req.params.id;
   let b = await Volunteer.findByIdAndUpdate({_id: id}, {isVerified: 'true'})
    if(b)
    {
        res.redirect("/admin");
    }
    else
    {
        res.json({'message': 'Error on Accepting'})
    }
})
router.get('/admin/reject/:id', async (req, res)=>{
    let id = req.params.id;
   let b = await Volunteer.findOneAndDelete({_id:id});
  if(b)
  {
      res.redirect("/admin");
  }
  else
  {
      res.json({'message': 'Some Error Occured on deletion'})
  }
  
})
router.get('/about', (req, res)=>{
    res.render('wait_till_verification');
})
router.get('/index', (req,res)=>{
    res.render('overall_services');
})
router.get('/admin',async (req,res)=>{
    let list = await Volunteer.find({isVerified: 'false'});
    res.render('volunteersToVerify', {data: list});
})
router.get('/ambulance', async(req,res)=>{
    let list = await Ambulance.find();
    res.render('ambulance', {data: list});

})
router.post('/ambulance/add', async(req,res)=>{
    var {name, contact, location_a, verified, comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
    let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
   let b = await temp.save()
   if(b)
   {
       res.redirect('/ambulance');

   }   
   else
   {
       res.json({message: 'Error Adding Ambulance in DB'})
   } 
    
})
router.get('/ambulance/delete/:id', async(req,res)=>{
    let b = await Ambulance.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/ambulance');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting ambulance'});
    }
})
router.get('/ambulance/update/:id', async(req,res)=>{
    
    let temp = await Ambulance.find({_id: req.params.id});
    res.render('ambulanceU', {temp});

})
router.post('/ambulance/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Ambulance.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified,comment} ).then(resp=>{
         res.redirect('/ambulance')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/wait', (req,res)=>{
    res.render('wait_till_verification');
})
router.get('/api/ambulance/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Ambulance.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
 
 });
   

 



})
router.get('/beds/update/:id', async(req,res)=>{
    
    let temp = await Beds.find({_id: req.params.id});
    res.render('bedsU', {temp});

})
router.post('/beds/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Beds.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment} ).then(resp=>{
         res.redirect('/beds')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})



router.get('/test1', (req,res)=>{
   
    Ambulance.find({
  location_c: {
   $near: {
    $maxDistance: 30000,
    $geometry: {
     type: "Point",
     coordinates: [28.7041, 77.1025]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  console.log(JSON.stringify(results, 0, 2));
 });
})
router.get('/beds', async (req,res)=>{
     let list = await Beds.find();
    res.render('beds', {data: list});
})
router.post('/beds/add', async (req,res)=>{
     var {name, contact, location_a, verified, avl_comment} = req.body;
 
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
    let temp = new Beds({name, contact, location_a, location_c: obj, verified, avl_comment});
   let b = await temp.save()
   if(b)
   {
       res.redirect('/beds');

   }   
   else
   {
       res.json({message: 'Error Adding Beds in DB'})
   } 
})
router.get('/beds/delete/:id', async(req,res)=>{
    let b = await Beds.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/beds');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting beds'});
    }
})
router.get('/api/beds/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Beds.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/doctor/update/:id', async(req,res)=>{
    
    let temp = await Doctor.find({_id: req.params.id});
    res.render('doctorU', {temp});

})
router.post('/doctor/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, specialization, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Doctor.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified,specialization, avl_comment} ).then(resp=>{
         res.redirect('/doctor')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})

router.get('/doctor', async (req,res)=>{
     let list = await Doctor.find();
    res.render('doctor', {data: list});
})
router.post('/doctor/add', async (req,res)=>{
    var {name, contact, location_a, verified,specialization, avl_comment} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Doctor({name, contact, location_a, location_c: obj, verified,specialization,avl_comment});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/doctor');

  }   
  else
  {
      res.json({message: 'Error Adding Doctor in DB'})
  } 
})
router.get('/doctor/delete/:id', async(req,res)=>{
    let b = await Doctor.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/doctor');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting doctors'});
    }
})
router.get('/api/doctor/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Doctor.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/food/update/:id', async(req,res)=>{
    
    let temp = await Food.find({_id: req.params.id});
    res.render('foodU', {temp});

})
router.post('/food/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Food.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment} ).then(resp=>{
         res.redirect('/food')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/food', async (req,res)=>{
    let list = await Food.find();
   res.render('food', {data: list});
})
router.post('/food/add', async (req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Food({name, contact, location_a, location_c: obj, verified,avl_comment});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/food');

  }   
  else
  {
      res.json({message: 'Error Adding Food in DB'})
  } 
})
router.get('/food/delete/:id', async(req,res)=>{
    let b = await Food.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/food');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting food'});
    }
})
router.get('/api/food/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Food.find({
  location_c: {
   $near: {
    $maxDistance: 3000000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
    res.json(results);
    console.log(error);
  
 });
   

 



})
router.get('/helpline', async (req,res)=>{
    let list = await Helpline.find();
   res.render('helpline', {data: list});
})
router.post('/helpline/add', async (req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Helpline({name, contact, location_a, location_c: obj, verified,avl_comment});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/helpline');

  }   
  else
  {
      res.json({message: 'Error Adding Helpline in DB'})
  } 
})
router.get('/helpline/delete/:id', async(req,res)=>{
    let b = await Helpline.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/helpline');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting helpline'});
    }
})
router.get('/api/helpline/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Helpline.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/helpline/update/:id', async(req,res)=>{
    
    let temp = await Helpline.find({_id: req.params.id});
    res.render('helplineU', {temp});

})
router.post('/helpline/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Helpline.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment} ).then(resp=>{
         res.redirect('/food')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/medicine', async (req,res)=>{
    let list = await Medicine.find();
    res.render('medicine', {data: list});
})
router.post('/medicine/add', async (req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Medicine({name, contact, location_a, location_c: obj, verified,avl_comment});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/medicine');

  }   
  else
  {
      res.json({message: 'Error Adding Medicine in DB'})
  } 
})
router.get('/medicine/delete/:id', async(req,res)=>{
    let b = await Medicine.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/medicine');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting medicine'});
    }
})
router.get('/api/medicine/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Medicine.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/medicine/update/:id', async(req,res)=>{
    
    let temp = await Medicine.find({_id: req.params.id});
    res.render('medicineU', {temp});

})
router.post('/medicine/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Medicine.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment} ).then(resp=>{
         res.redirect('/medicine')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/oxygen', async (req,res)=>{
    let list = await Oxygen.find();
    res.render('oxygen', {data: list});
})
router.post('/oxygen/add', async (req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Oxygen({name, contact, location_a, location_c: obj, verified,avl_comment});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/oxygen');

  }   
  else
  {
      res.json({message: 'Error Adding Oxygen in DB'})
  } 
})
router.get('/oxygen/delete/:id', async(req,res)=>{
    let b = await Oxygen.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/oxygen');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting oxygen'});
    }
})
router.get('/api/oxygen/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Oxygen.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/oxygen/update/:id', async(req,res)=>{
    
    let temp = await Oxygen.find({_id: req.params.id});
    res.render('oxygenU', {temp});

})
router.post('/oxygen/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Oxygen.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment} ).then(resp=>{
         res.redirect('/oxygen')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/plasma', async (req,res)=>{
    let list = await Plasma.find();
    res.render('plasma', {data: list});
})
router.post('/plasma/add', async (req,res)=>{
    var {name, contact, location_a, verified, avl_comment, blood_group} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Plasma({name, contact, location_a, location_c: obj, verified,avl_comment, blood_group});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/plasma');

  }   
  else
  {
      res.json({message: 'Error Adding Plasma in DB'})
  } 
})
router.get('/plasma/delete/:id', async(req,res)=>{
    let b = await Plasma.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/plasma');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting plasma'});
    }
})
router.get('/api/plasma/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Plasma.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/plasma/update/:id', async(req,res)=>{
    
    let temp = await Plasma.find({_id: req.params.id});
    res.render('plasmaU', {temp});

})
router.post('/plasma/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment, blood_group} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Plasma.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment, blood_group} ).then(resp=>{
         res.redirect('/plasma')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/testing', async (req,res)=>{
    let list = await Testing.find();
    res.render('testing', {data: list});
})
router.post('/testing/add', async (req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;

   let temp_address = location_a.replace(/ /g, "+")
   let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
   let temp_response = await fetch(query_string);
   let response = await temp_response.json();
   let obj = {
       type: "Point",
       coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
   }
   let temp = new Testing({name, contact, location_a, location_c: obj, verified,avl_comment});
  let b = await temp.save()
  if(b)
  {
      res.redirect('/testing');

  }   
  else
  {
      res.json({message: 'Error Adding Testing in DB'})
  } 
})
router.get('/testing/delete/:id', async(req,res)=>{
    let b = await Testing.findOneAndDelete({_id:req.params.id});

    if(b)
    {
        res.redirect('/testing');
    }
    else
    {
        res.status(400).json({message: 'Error in deleting testing'});
    }
})
router.get('/api/testing/:clientLocation/:api' ,async (req,res)=>{
    if(req.params.api != "testkey")
    {
        return res.json({message:' Api Key Error'})
    }
  let temp1 =  req.params.clientLocation.split("+");
  var c_lat = parseFloat(temp1[0]);
  var c_lon = parseFloat(temp1[1]);
   Testing.find({
  location_c: {
   $near: {
    $maxDistance: 300000,
    $geometry: {
     type: "Point",
     coordinates: [c_lat, c_lon]
    }
   }
  }
 }).find((error, results) => {
   res.json(results);
  
 });
   

 



})
router.get('/testing/update/:id', async(req,res)=>{
    
    let temp = await Testing.find({_id: req.params.id});
    res.render('testingU', {temp});

})
router.post('/testing/update/:id', async(req,res)=>{
    var {name, contact, location_a, verified, avl_comment} = req.body;
    let temp_address = location_a.replace(/ /g, "+")
    let query_string = `https://maps.googleapis.com/maps/api/geocode/json?address=${temp_address}&key=${process.env.API_KEY}`
    let temp_response = await fetch(query_string);
    let response = await temp_response.json();
    let obj = {
        type: "Point",
        coordinates: [parseFloat(response.results[0].geometry.location.lat), parseFloat(response.results[0].geometry.location.lng)]
    }
     Testing.findByIdAndUpdate({_id: req.params.id},{name, contact, location_a, location_c: obj, verified, avl_comment} ).then(resp=>{
         res.redirect('/testing')

     }).catch(error=>{
         console.log(error)
     })
   // let temp = new Ambulance({name, contact, location_a, location_c: obj, verified,comment});
//    let b = await temp.save()
//    if(b)
//    {
//        res.redirect('/ambulance');

//    }   
//    else
//    {
//        res.json({message: 'Error Updating Ambulance in DB'})
//    } 
})
router.get('/count', async (req,res)=>{
    let ambulance = await Ambulance.countDocuments()
    let beds = await Beds.countDocuments()
    let doctor = await Doctor.countDocuments();
    let food = await Food.countDocuments();
    let helpline = await Helpline.countDocuments();
    let medicine = await Medicine.countDocuments();
    let oxygen = await Oxygen.countDocuments();
    let plasma = await Plasma.countDocuments();
    let testing = await Testing.countDocuments();
    let volunteers = await Volunteer.countDocuments();
    res.json({ambulance,beds, doctor, food,helpline,medicine,oxygen,plasma,testing,volunteers});
})
router.get('/foodbud', async (req,res)=>{
    let b = await Food.syncIndexes();
    
})




















































module.exports = router;

