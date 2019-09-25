const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email.']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minlength: [8, 'Password must have 8 characters.'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please retype your password'],
        validate: {
            //This only works on CREATE and SAVE, not UPDATE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match.'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

//Encrypt password
userSchema.pre('save', async function(next) {
    //Only run function if password modified
    if (!this.isModified('password')) return next();

    //bcrypt hash 2nd param-the higher the number, the better the encryption and the higher the CPU usage
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
//filter out inactive users from user functions
userSchema.pre(/^find/, async function(next) {
    this.find({ active: { $ne: false } });
    next();
});
//on password change, update passwordChangedAt field
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});
//validate password
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
//check that token not issued prior to a password change
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
