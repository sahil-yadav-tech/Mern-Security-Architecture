const errorMiddleware = (err, req, res, next) => {

  console.log(err.message ,err,err.statusCode ,  "errorMiddleware.js");
  

  res.status(err.statusCode || 500).json({
    success: false,
    status: err.statusCode || "error",
    message: err.message || "Server Error",
  });

};

export default errorMiddleware;