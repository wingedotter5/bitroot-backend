const express = require("express");
const cors = require("cors");
const middleware = require("./middleware");
const contactsRouter = require("./controllers/contacts");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use(middleware.notFoundHandler);
app.use(middleware.errorHandler);

module.exports = app;
