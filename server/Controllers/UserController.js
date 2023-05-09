import asyncHandler from 'express-async-handler';
import User from '../Models/UserModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middlewares/Auth.js';


// @desc / Register a new user
// @route POST /api/users
// @access PUBLIC

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, image } = req.body;

    try {
        const userExists = await User.findOne({ email })
        // check if user exists
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }
        //create new user
        // res.status(201).json({
        //     fullName,
        //     email,
        //     password,
        //     image,
        // })

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user in DB
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            image,
        });

        // if user created successfully send data to the client
        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        }

        else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// @desc / Login user
// @route POST /api/users/login
// @access PUBLIC

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        // find user in DB
        const user = await User.findOne({ email });

        //if user exists compare password with hashed password then send user data and token to the client
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        }
        // if user not found or password do not match. Throw invalid user or password
        else {
            res.status(401);
            throw new Error("Invalid email or password");
        }

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// ********** PRIVATE CONTROLLERS *************

// @desc / Update user profile
// @route PUT /api/users/profile
// @access PRIVATE
const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, email, image } = req.body;
    try {
        // find user in DB
        const user = await User.findById(req.user._id);
        // if user found update user data and save it into DB
        if (user) {
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.image = image || user.image;

            const updatedUser = await user.save();

            // send updated user data and token to client
            res.json({
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                image: updatedUser.image,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(user._id),
            });
        }
        // else send error message
        else {
            res.status(401);
            throw new Error("Invalid email or password");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @desc / Delete user profile
// @route DELETE /api/users
// @access PRIVATE
const deleteUserProfile = asyncHandler(async (req, res) => {
    try {
        // find user in DB
        const user = await User.findById(req.user._id);
        // if user exists delete from DB
        if (user) {
            // if user is admin then throw error message
            if (user.isAdmin) {
                res.status(400);
                throw new Error("Admin user can't be deleted");
            }

            // else delete user from DB
            // await user.remove();
            await User.deleteOne({ _id: req.user._id });
            res.json({ message: "User deleted successfully" });
        }
        else {
            res.status(400);
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @decs Change your password
// @route PUT /api/users/password
// @access PRIVATE

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        // find user in DB
        const user = await User.findById(req.user._id);
        // if user exists compare old password with hashed password then update user password and save it in DB
        if (user && (await bcrypt.compare(oldPassword, user.password))) {
            // hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            await user.save();
            res.json({ message: "Password changed successfully" });
        }
        // else send error message
        else {
            res.status(400);
            throw new Error("Invalid old password");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




// @desc Get all liked movies
// @route GET /api/users/favorites
// @access PRIVATE

const getLikedMovies = asyncHandler(async (req, res) => {
    try {
        // find user in DB
        const user = await User.findById(req.user._id).populate("likedMovies");
        // if user exists send liked movies it to the client
        if (user) {
            res.json(user.likedMovies);
        }
        // else send error messages
        else {
            res.status(400);
            throw new Error("User not found!");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// @desc Add movie to liked movies
// @route POST /api/users/favorites
// @access PRIVATE

const addLikedMovies = asyncHandler(async (req, res) => {
    const {movieId} = req.body;
    try {
        // find user in DB
        const user = await User.findById(req.user._id);
        // if user exists send liked movies it to the client
        if (user) {
            // check if movie already liked
            // const isMovieLiked = user.likedMovies.find(
            //     (movie) => movie.toString() === movieId
            // );

            if (user.likedMovies.includes(movieId)) {
                res.status(400);
                throw new Error("Movie already liked!");
            }

            user.likedMovies.push(movieId);
            await user.save();
            res.json(user.likedMovies);
        }
        // else send error messages
        else {
            res.status(400);
            throw new Error("Movie not found!");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @desc Delete all liked movies
// @route DELETE /api/users/favorites
// @access PRIVATE

const deleteLikedMovies = asyncHandler(async (req, res) => {
    try {
        // find user in DB
        const user = await User.findById(req.user._id);
        // if user exists send liked movies it to the client
        if (user) {
            user.likedMovies = [];
            await user.save();
            res.json({ message: "Your favorite movies deleted successfully!" });

        }
        // else send error messages
        else {
            res.status(400);
            throw new Error("User not found!");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// ********** ADMIN CONTROLLERS *************

// @desc Get all users
// @route GET /api/users
// @access PRIVATE/Admin

const getUsers = asyncHandler(async (req, res) => {
    try {
        // find all the users in DB
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});





// @desc Delete user
// @route DELETE /api/users/:id
// @access PRIVATE/Admin

const deleteUser = asyncHandler(async (req, res) => {
    try {
        // find all the users in DB
        const user = await User.findById(req.params.id);
        // if user exists delete it from the DB
        if (user) {
            // if user is admin throw error message
            if (user.isAdmin) {
                res.status(400);
                throw new Error("Can't delete admin user");
            }
            // else delete user from DB
            await user.deleteOne({ _id: req.user._id });
            res.json({ message: "User deleted successfully" });
        }
        // else send error message
        else{
            res.status(400);
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});





export { registerUser, loginUser, updateUserProfile, deleteUserProfile, changeUserPassword, getLikedMovies, addLikedMovies, deleteLikedMovies, getUsers, deleteUser, };