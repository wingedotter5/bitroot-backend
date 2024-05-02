const notFoundHandler = (req, res) => {
  res.status(404).send({ error: "404 Not Found" });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  next(err);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
