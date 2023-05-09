import asyncHandler from 'express-async-handler';
import Categories from '../Models/CategoriesModel.js';


// *********** PUBLIC CONTROLLERS ************

// @desc Get all categories
// @route GET /api/categories
// @access PUBLIC

const getCategories = asyncHandler(async (req, res) => {
    try {
        // find all the categories in DB
        const categories = await Categories.find({});
        res.json(categories);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// *********** ADMIN CONTROLLERS ************

// @desc update  category
// @route PUT /api/categories/:id
// @access PRIVATE/Admin

const updateCategory = asyncHandler(async (req, res) => {
    try {

        // find the category from DB
        const category = await Categories.findById(req.params.id);

        if(category){
            category.title = req.body.title || category.title;
            // save category in the database
            const updatedCategory = await category.save();
            //send new category to the client
            res.json(updatedCategory);
        }

        else{
            res.status(400);
            throw new Error("Category not found!");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @desc create new category
// @route POST /api/categories
// @access PRIVATE/Admin

const createCategory = asyncHandler(async (req, res) => {
    try {
        // get title from request body
        const {title} = req.body;

        // find all the categories in DB
        const category = new Categories({
            title,
        });
        // save category in the database
        const createdCategory = await category.save();
        //send new category to the client
        res.status(201).json(createCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @desc Delete movie
// @route DELETE /api/movies/:id
// @access Private/Admin

const deleteCategory = asyncHandler(async (req, res) => {
    try {
        // find movie in the database
        const category = await Categories.findById(req.params.id);
        // if the movie found delete it
        if (category) {
            await category.deleteOne(category._id);
            res.json({ message: "Category deleted successfully" });
        }
        // else send error message
        else {
            res.status(404);
            throw new Error("Category not found");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


export {getCategories, createCategory, updateCategory, deleteCategory};