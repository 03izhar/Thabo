const User = require("../models/userModel");
const Security = require("../models/securityModel");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { cloudinaryUploadImage } = require("../utils/cloudinary");
const fs = require("fs");

const sec_key = "secretkey";

// function to secure password 
const securePassword = async (password) => {
    try {
        const secure_password = await bcrypt.hash(password, 10);
        return secure_password;
    } catch (error) {
        throw new Error(error);
    }
}

// for sending mail
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'izhar.qadeer@indicchain.com',
                pass: 'kfqo jxql sqjb ufdi'
            }
        });
        const mailOptions = {
            from: 'izhar.qadeer@indicchain.com',
            to: email,
            subject: 'For Mail Verification',
            html: `<h1>Hello ${name}</h1><p>Please click <a href="http://127.0.0.1:5000/api/users/verify?id=${user_id}">here</a> to verify your mail.</p>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('Email has been sent:' + info.response);
            }
        })
    } catch (error) {
        throw new Error(error);
    }
}

// for reset password send mail
const sendResetPasswordOTP = async (email, OTP) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'izhar.qadeer@indicchain.com',
                pass: 'kfqo jxql sqjb ufdi'
            }
        });
        const mailOptions = {
            from: 'izhar.qadeer@indicchain.com',
            to: email,
            subject: 'For Reset Password',
            html: `<h1>Hello!!</h1><p>Your OTP for reset password is ${OTP}. And it is valid for 5 minutes only.</p>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('OTP has been sent to your mail:' + info.response);
                res.send(`Your otp is: ${OTP}`);
            }
        })
    } catch (error) {
        throw new Error(error);
    }
}

// generate token 
const create_token = async (id) => {
    const newtoken = jwt.sign({ _id: id }, sec_key);
    return newtoken;
};

// Register a new user
const createUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if (password !== confirmPassword) {
            return res.send("Passwords do not match");
        }
        const passwordHash = await securePassword(password);
        const findUser = await User.findOne({ email: email });
        if (!findUser) {
            const user = new User({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: passwordHash,
                images: req.files
            });

            const userData = await user.save();
            // res.json(userData);
            if (userData) {
                sendVerifyMail(req.body.name, req.body.email, userData._id);
                res.json({ message: "Your registration has been successful, Please check your email to verify your account.", userData });
            } else {
                res.send("Your registration has been failed.");
            }
        } else {
            res.status(400).send("User already exists");
        }
    } catch (error) {
        throw new Error(error);
    }
}

// verify email 
const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        // console.log(updateInfo);
        res.send("email-verified");

    } catch (error) {
        throw new Error(error);
    }
}

// Login user
const loginUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    return res.send("Please verify your mail first");
                }
                const token = await create_token(userData._id);
                const user = await User.findOneAndUpdate({ email }, { $set: { token: token } })
                return res.send(user);
            } else {
                return res.send("Password is incorrect. Please check");
            }
        } else {
            return res.send("Email is not found, Please check or Register.");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).send("Failed to log in. Please try again.");
    }
}


// Generate OTP
const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
        return res.json({ message: "Email is incorrect." });
    }

    if (userData.is_verified === 0) {
        return res.json({ message: "Please verify your email first." });
    }

    const OTP = generateOTP();
    try {
        // Store OTP and associated email in the database
        await User.findOneAndUpdate(
            { email },
            { email, otp: OTP },
            { upsert: true, new: true }
        );

        // Send OTP through email or SMS
        await sendResetPasswordOTP(email, OTP);
        return res.send("Please check your email to reset your password.");
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).send("Failed to send OTP. Please try again.");
    }
});

// Verify OTP for password reset
const verifyResetPasswordOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    try {
        const resetPasswordData = await User.findOne({ email });
        if (!resetPasswordData) {
            return res.send("No OTP found for this email.");
        }
        const storedOTP = resetPasswordData.otp;

        const isOTPValid = storedOTP === otp;
        if (isOTPValid) {
            return res.send("OTP is valid. Proceed with password reset.");
        } else {
            return res.status(400).send("Invalid OTP. Please try again.");
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).send("Failed to verify OTP. Please try again.");
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) {
            return res.send("Passwords do not match");
        }

        const newPasswordHash = await securePassword(password);
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { password: newPasswordHash },
            { new: true }
        );
        // to delete otp from db 
        await User.findOneAndUpdate(email, { $set: { otp: '' } });

        res.send("Password reset successful");
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Failed to reset password. Please try again.");
    }
});

// upload user images 
const uploadImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const uploader = (path) => cloudinaryUploadImage(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }
        const findUser = await User.findByIdAndUpdate(id, {
            images: urls.map((file) => {
                return file;
            })
        }, { new: true });
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Terms And Conditions 
const termsCondition = async (req, res) => {
    try {
        const { termsAndConditions } = req.body;
        if (termsAndConditions !== undefined) {
            const updatedTerms = await Security.findOneAndUpdate(
                {},
                { $set: { termsAndConditions: termsAndConditions } },
                { new: true, upsert: true }
            );
            res.json({ termsAndConditions: updatedTerms.termsAndConditions });
        } else {
            const existingTerms = await Security.findOne();
            if (existingTerms) {
                res.json({ termsAndConditions: existingTerms.termsAndConditions });
            } else {
                res.status(404).send("Terms and conditions not found");
            }
        }
    } catch (error) {
        throw new Error(error);
    }
};

// Privacy and Policy 
const privacyPolicy = async (req, res) => {
    try {
        const { privacyAndPolicy } = req.body;
        if (privacyAndPolicy !== undefined) {
            const updatedPrivacy = await Security.findOneAndUpdate(
                {},
                { $set: { privacyAndPolicy: privacyAndPolicy } },
                { new: true, upsert: true }
            );
            res.json({ privacyAndPolicy: updatedPrivacy.privacyAndPolicy });
        } else {
            const existingPrivacy = await Security.findOne();

            if (existingTerms) {
                res.json({ privacyAndPolicy: existingPrivacy.privacyAndPolicy });
            } else {
                res.status(404).send("Terms and conditions not found");
            }
        }
    } catch (error) {
        throw new Error(error);
    }
};

// get both terms and privacy 
const getTermsAndPrivacy = async (req, res) => {
    try {
        const termsAndPrivacy = await Security.findOne({}, { _id: 0, termsAndConditions: 1, privacyAndPolicy: 1 });
        if (termsAndPrivacy) {
            res.json(termsAndPrivacy);
        } else {
            res.status(404).send("Terms and privacy not found");
        }
    } catch (error) {
        throw new Error(error);
    }
};

// location




module.exports = {
    createUser,
    verifyMail,
    loginUser,
    forgotPassword,
    verifyResetPasswordOTP,
    resetPassword,
    uploadImage,
    termsCondition,
    privacyPolicy,
    getTermsAndPrivacy
}