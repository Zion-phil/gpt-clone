const errorHandler = (err, req, res, next) => {
    return res.status(500).json({
        status: false,
        message: 'Something went wrong try again later',
    });
};

export default errorHandler;

// this file will hand any errors that comes from controller and service functions and handle it in such structured way