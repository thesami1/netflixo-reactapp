import asyncHandler from 'express-async-handler';
import { MoviesData } from '../Data/MovieData.js';
import Movie from '../Models/MoviesModel.js';

/********  PUBLIC CONTROLLERS    ****** */
// @desc import movies
// @route POST /api/movies/import
// @access Public

const importMovies = asyncHandler(async (req, res) => {
    // first make sure our Movies table is empty by delete all documents
    await Movie.deleteMany({});
    // then we insert all movies from MoviesData
    const movies = await Movie.insertMany(MoviesData);
    res.status(201).json(movies);
});




// @desc get all movies
// @route GET /api/movies
// @access Public

const getMovies = asyncHandler(async (req, res) => {
    try {
        // filter movies by category, time, language, rate, year, and search
        const { category, time, language, rate, year, search } = req.query;
        let query = {
            ...(category && { category }),
            ...(time && { time }),
            ...(language && { language }),
            ...(rate && { rate }),
            ...(year && { year }),
            ...(search && { name: { $regex: search, $options: "i" } }),
        }


        // load more movies functionality
        const page = Number(req.query.pageNumber) || 1; // if page number is not provided we set it to 1
        const limit = 4; // 4 movies per page
        const skip = (page - 1) * limit; // skip 2 movies per page


        // find movies by query, skip and limit
        const movies = await Movie.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);


        // get total number of movies
        const count = await Movie.countDocuments(query);

        // send response with movies and total number of movies
        res.json({ movies, page, pages: Math.ceil(count / limit), totalMovies: count, });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});




// @desc get movie by id
// @route GET /api/movies/:od
// @access Public

const getMovieById = asyncHandler(async (req, res) => {
    try {
        // find movie by id in the database
        const movie = await Movie.findById(req.params.id);

        // if the movie if found send it to the client
        if (movie) {
            res.json(movie);
        }
        // if the movie is not found send 404 error
        else {
            res.status(404);
            throw new Error("Movie not found");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




// @desc get top rated movies 
// @route GET /api/movies/rated/top
// @access Public

const getTopRatedMovies = asyncHandler(async (req, res) => {
    try {
        // find top rated movies
        const movies = await Movie.find({}).sort({ rate: -1 });

        // send top rated movies to the client
        res.json(movies);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @desc get random movies 
// @route GET /api/movies/random/all
// @access Public

const getRandomMovies = asyncHandler(async (req, res) => {
    try {
        // find random movies
        const movies = await Movie.aggregate([{ $sample: { size: 8 } }]);

        // send random movies to the client
        res.json(movies);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// *********** PRIVATE CONTROLLERS ************

// @desc Create movie review
// @route POST /api/movies/:id/reviews
// @access Public

const createMovieReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    try {
        // find movie by id in a database
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            // check if the user already reviewed this movie
            const alreadyReviewed = movie.reviews.find(
                (r) => r.userId.toString() === req.user._id.toString()
            );
            // if the user already reviewd this movie send 400 error
            if (alreadyReviewed) {
                res.status(400);
                throw new Error("You already reviewed this movie");
            }

            // else create a new review
            const review = {
                userName: req.user.fullName,
                userId: req.user._id,
                userImage: req.user.image,
                rating: Number(rating),
                comment,
            }
            // push the new review to the reviews array
            movie.reviews.push(review);

            // increment the number of reviews
            movie.numberOfReviews = movie.reviews.length;

            // calculate the new rate
            movie.rate = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length;

            // save the movie in the database
            await movie.save();

            // send the new movie to the client
            res.status(201).json({
                message: "Review added",
            });
        }
        else {
            res.json(404);
            throw new Error("Movie not found");
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// *********** ADMIN CONTROLLERS ************

// @desc Update movie
// @route PUT /api/movies/:id
// @access Private/Admin

const updateMovie = asyncHandler(async (req, res) => {
    try {
        // get data from request body
        const {
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts
        } = req.body;

        // find movie by id from database
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            // update movie data
            movie.name = name || movie.name;
            movie.desc = desc || movie.desc
            movie.image = image || movie.image;
            movie.titleImage = titleImage || movie.titleImage;
            movie.rate = rate || movie.rate;
            movie.numberOfReviews = numberOfReviews || movie.numberOfReviews
            movie.category = category || movie.category;
            movie.time = time || movie.time;
            movie.language = language || movie.language;
            movie.year = year || movie.year;
            movie.video = video || movie.video;
            movie.casts = casts || movie.casts;

            // save the movie in database
            const updatedMovie = await movie.save();
            // send the update movie to the client
            res.status(201).json(updatedMovie);
        }
        else {
            res.status(404);
            throw new Error("Movie not found");
        }

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// @desc Delete movie
// @route DELETE /api/movies/:id
// @access Private/Admin

const deleteMovie = asyncHandler(async (req, res) => {
    try {
        // find movie in the database
        const movie = await Movie.findById(req.params.id);
        // if the movie found delete it
        if (movie) {
            await movie.deleteOne(movie._id);
            res.json({ message: "Movie deleted successfully" });
        }
        // else send error message
        else {
            res.status(404);
            throw new Error("Movie not found");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




// @desc Delete all movies
// @route DELETE /api/movies
// @access Private/Admin

const deleteAllMovie = asyncHandler(async (req, res) => {
    try {
        await Movie.deleteMany({});
        res.json({ message: "All movies deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// @desc Create movie
// @route POST /api/movies
// @access Private/Admin

const createMovie = asyncHandler(async (req, res) => {
    try {
        // get data from request body
        const {
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts
        } = req.body;

        const movie = new Movie({
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts,
            userId: req.user._id,
        });

        // save movie in the database
        if (movie) {
            const createdMovie = await movie.save();
            res.status(201).json(createdMovie);
        }
        // else send error message
        else {
            res.status(404);
            throw new Error("Ibvalid movie data");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


export { importMovies, getMovies, getMovieById, getTopRatedMovies, getRandomMovies, createMovieReview, updateMovie, deleteMovie, deleteAllMovie, createMovie};