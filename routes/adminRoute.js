const express=require('express');
const admin_route=express();
const bodyprser=require('body-parser');

admin_route.use(bodyprser.json());
admin_route.use(bodyprser.urlencoded({extended:true}));

const auth=require("../middleware/Auth");
const adminController=require('../controllers/adminController');

admin_route.post('/signup',adminController.create_admin);
admin_route.get('/login',adminController.login);
admin_route.post('/forget-password',auth,adminController.forget_password);
admin_route.post('/reset-password',auth,adminController.reset_password);


module.exports=admin_route;