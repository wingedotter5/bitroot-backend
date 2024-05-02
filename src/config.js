require("dotenv").config();

const MONGODB_URI =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_MONGODB_URI
    : process.env.PROD_MONGODB_URI;

const PORT = process.env.PORT || 3000;

module.exports = {
  MONGODB_URI,
  PORT,
};
