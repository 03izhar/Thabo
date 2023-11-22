const express = require('express');
const Auth = require('../middleware/Auth');

const {
    createUser,
    verifyMail,
    loginUser,
    forgotPassword,
    verifyResetPasswordOTP,
    resetPassword,
    uploadImage,
    termsCondition,
    getTermsAndPrivacy,
    privacyPolicy,
    getLocation
} = require('../controllers/userController');
const { uploadPhoto, userImgResize } = require('../middleware/uploadImage');

const {openapiSpecification} = require('../swagger/swagger');
const SwaggerUi = require('swagger-ui-express');

const router = express.Router();

router.use('/docs', SwaggerUi.serve, SwaggerUi.setup(openapiSpecification));

/**
 * @swagger
 * /:
 *  get:
 *      summary: This api is used to check get method is working or not 
 *      description:This api is used to check is get method is working
 *      responses: 
 *           200:
 *               description: To test get method
 */


router.post('/register', createUser);

router.put('/upload/:id', Auth, uploadPhoto.array("image", 1), userImgResize, uploadImage);

router.get('/verify', verifyMail);

router.get('/login', loginUser);

router.post('/forgot-password', Auth, forgotPassword);

router.post('/forgot-password-otp', Auth, verifyResetPasswordOTP);

router.post('/reset-password', Auth, resetPassword);

router.post('/terms', termsCondition);

router.post('/privacy', privacyPolicy);

router.get('/terms-and-privacy', getTermsAndPrivacy);



module.exports = router;