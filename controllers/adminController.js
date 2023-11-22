const Admin = require("../models/adminModel");
const sec_key = "secretkey";
const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const create_token = async (id) => {
    const newtoken = await jwt.sign({ _id: id }, sec_key);
    return newtoken;
};

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
        user: "prince.raj@indicchain.com",
        pass: "etptmnwhgacmshxu",
    },
});

let otpdata = { otp: null, timestamp: null };

const generateotp = () => {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    otpdata = { otp: otp, timestamp: Date.now() };
};

const isOTPValid = (otp) => {
    if (!otpdata.otp || !otpdata.timestamp) {
        return false;
    }

    if (otpdata.otp != otp) {
        return false;
    }

    const currentTime = Date.now();
    return currentTime - otpdata.timestamp < 60000;
};

const securePassword = async (password) => {
    try {
        const passhash = await bcryptjs.hash(password, 10);
        return passhash;
    } catch (err) {
        throw new Error(err.message);
    }
};
const create_admin = async (req, res) => {
    try {
        const item = await Admin.findOne({ email: req.body.email });
        if (item) {
            res.status(200).send("Admin All Ready Exists!");
        } else {
            const spassword = await securePassword(req.body.password);
            const admin = new Admin({
                name: req.body.name,
                adminName: req.body.adminName,
                email: req.body.email,
                password: spassword,
                role: req.body.role,
            });
            const result = await admin.save();
            res.status(200).send({ status: true, msg: " Add Admin!", data: result });
        }
    } catch (err) {
        res.status(200).send(err.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await Admin.findOne({ email: email });
        if (data) {
            const passmatch = await bcryptjs.compare(password, data.password);
            console.log(passmatch);
            if (passmatch) {
                const token = await create_token(data._id);
                const Result = {
                    _id: data._id,
                    name: data.name,
                    adminName: data.adminName,
                    email: data.email,
                    password: data.password,
                    token: token,
                };
                //console.log(Result)
                const update = await Admin.updateOne(
                    { email: email },
                    { $set: { token: token, otp: 0 } }
                );

                const result = {
                    success: true,
                    msg: "Admin Details",
                    data: Result,
                };
                res.send(result);
            } else {
                res.send("login Failed to invalid password!");
            }
        } else {
            res.send("login Failed due to incorrect details!");
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
};

let validotp = "";
const forget_password = async (req, res) => {
    try {
        generateotp();
        validotp = otpdata.otp;
        const { email } = req.body;

        const mailOptions = {
            from: "prince.raj@indicchain.com",
            to: email,
            subject: "forget Password Otp Mail",
            text: `this message regarding otp: ${validotp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error occurred: ", error);
                res.send("Error occurred while sending email");
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        res
            .status(200)
            .send(`Your One-Time OTP is: ${validotp} and email send successfully`);
    } catch (err) {
        res.status(400).send(err.message);
    }
};

const reset_password = async (req, res) => {
    try {
        const { otp, password, cpassword, email } = req.body;
        const verify = isOTPValid(otp);

        if (verify) {
            if (password === cpassword) {
                const newPassword = await securePassword(password);
                console.log(newPassword);
                const update = await Admin.findOneAndUpdate(
                    { email: email },
                    { $set: { password: newPassword, otp: 1 } }
                );
                console.log(update);
                res.status(200).send({
                    status: true,
                    msg: "Password reset!",
                    data: update,
                });
            } else {
                res.status(400).send({
                    status: false,
                    msg: "Password and confirm password do not match!",
                });
            }
        } else {
            res.status(400).json({
                status: false,
                msg: "Invalid OTP!",
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            msg: err.message,
        });
    }
};

// Assuming you have functions like verifyOTP and securePassword defined elsewhere in your code.

module.exports = {
    create_admin,
    login,
    forget_password,
    reset_password,
};
