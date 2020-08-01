import mongoose from "mongoose";

export default {
  mongoose,
  connect: () => {
    mongoose.connect("mongodb://localhost:27017/test-database-temporary", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      poolSize: 10,
    });
  },
  disconnect: (done: () => void) => {
    mongoose.disconnect(() => {
      done();
    });
  },
};
