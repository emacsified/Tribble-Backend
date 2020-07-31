import mongoose from "mongoose";

export default {
  mongoose,
  connect: () => {
    mongoose.connect("mongodb://localhost:27017/test-database-temporary", {
      useNewUrlParser: true,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      poolSize: 10,
    });
  },
  disconnect: (done: () => void) => {
    mongoose.disconnect(() => {
      setTimeout(() => {
        done();
      }, 5000);
    });
  },
};
