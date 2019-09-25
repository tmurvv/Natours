const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/* to store photo to disk */
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not image format', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

/******************
 * User CRUD for admin (see below for CRUD performed by user)
 ******************/
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Please use /signup to create a new user.'
    });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//for admin to update records, not for user to self-update (see 'updateMe')
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

/******************
 * User CRUD performed by user, not admin (see above for CRUD performed by admin)
 ******************/
//for user to see their own information
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
//for user to update email or username, not for admin to update records
exports.updateMe = catchAsync(async (req, res, next) => {
    //1) Create error if user POSTS password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword',
                400
            )
        );
    }
    //2) Filter fields not allowed to be updated by user
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    //3) Update User
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );
    //4) Return results
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
