const app = require("./app");
const config = require("./config");
const mongoose = require("mongoose");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log(`Conntected to database`);
    app.listen(config.PORT, () => {
      console.log(`Started server on ${config.PORT}`);
    });
  })
  .catch(console.error);
