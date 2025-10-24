const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;
// If MONGO_URI is provided in the environment, use it. This helps on systems where
// mongodb-memory-server cannot start because a native library (eg libcrypto) is missing.
const USE_REAL = Boolean(process.env.MONGO_URI);

module.exports = {
  connect: async () => {
    if (USE_REAL) {
      // Connect to provided MongoDB instance
      await mongoose.connect(process.env.MONGO_URI, { dbName: "test-blog" });
      return;
    }
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
  },
  close: async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  },
  clear: async () => {
    const collections = Object.keys(mongoose.connection.collections);
    // eslint-disable-next-line no-restricted-syntax
    for (const name of collections) {
      // eslint-disable-next-line no-await-in-loop
      await mongoose.connection.collections[name].deleteMany();
    }
  },
};
