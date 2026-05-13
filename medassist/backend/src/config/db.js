const mongoose = require("mongoose");
const { mongoUri } = require("./env");
const logger = require("../utils/logger");

async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  logger.info("MongoDB connected");
}

module.exports = connectDb;
