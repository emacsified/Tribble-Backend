import mongoose from "mongoose";

export default {
  mongoose,
  connect: () => {
    mongoose.connect("mongodb://localhost:27017/test-database-temporary");
  },
  disconnect: (done: () => void) => {
    mongoose.disconnect(done);
  },
};
