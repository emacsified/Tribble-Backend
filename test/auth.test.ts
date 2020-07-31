import request from "supertest";

import app from "../src/app";
import mongo from "./mongoSetup";
import { UserDocument } from "../src/models/User";
const User = mongo.mongoose.model("User");

describe("Auth Controller Routes", () => {
  beforeAll(() => {
    mongo.connect();
  });
  afterAll((done) => {
    mongo.disconnect(done);
  });

  beforeEach((done) => {
    const newUser = new User({
      email: "test@test.test",
      password: "test",
    });

    newUser.save().then(() => {
      done();
    });
  });

  afterEach((done) => {
    User.deleteMany({}).then(() => {
      done();
    });
  });

  describe("register route", () => {
    it("should reject a request with missing parameters", async () => {
      const missingEmail = await request(app)
        .post("/register")
        .send({ password: "test", confirmPassword: "test" });

      expect(missingEmail.status).toBe(400);
      expect(missingEmail.body.error).toBe("Missing credentials");

      const missingPass = await request(app)
        .post("/register")
        .send({ email: "test2@test.test", confirmPassword: "test" });

      expect(missingPass.status).toBe(400);
      expect(missingPass.body.error).toBe("Missing credentials");

      const missingPass2 = await request(app)
        .post("/register")
        .send({ email: "test2@test.test", password: "test" });

      expect(missingPass2.status).toBe(400);
      expect(missingPass2.body.error).toBe("Missing credentials");
    });

    it("should reject a request with incorrect parameters", async () => {
      const invalidEmail = await request(app)
        .post("/register")
        .send({ email: "test2.co", password: "test", confirmPassword: "test" });
      expect(invalidEmail.status).toBe(400);
      expect(invalidEmail.body.error).toBe("Invalid email");

      const invalidPassword = await request(app)
        .post("/register")
        .send({ email: "test2@test.test", password: "test", confirmPassword: "testNotMatching" });
      expect(invalidPassword.status).toBe(400);
      expect(invalidPassword.body.error).toBe("Passwords do not match");
    });

    it("should reject a request with an existing user", async () => {
      const existingUser = await request(app)
        .post("/register")
        .send({ email: "test@test.test", password: "test", confirmPassword: "test" });
      expect(existingUser.status).toBe(400);
      expect(existingUser.body.error);
    });

    it("should accept a request with correct parameters", async () => {
      const validRequest = await request(app)
        .post("/register")
        .send({ email: "test2@test.test", password: "test", confirmPassword: "test" });
      expect(validRequest.status).toBe(200);
    });

    it("should create a user correctly", async () => {
      const validRequest = await request(app)
        .post("/register")
        .send({ email: "test2@test.test", password: "test", confirmPassword: "test" });
      expect(validRequest.status).toBe(200);

      User.findOne({ email: "test2@test.test" }).then((doc) => {
        const user = doc as UserDocument;
        if (!user) {
          throw "error";
        }
        expect(user.email).toBeTruthy();
      });
    });
  });

  describe("login route", () => {
    it("should reject a request with missing params", async () => {
      const missingPassword = await request(app).post("/login").send({ email: "test@test.test" });
      expect(missingPassword.status).toBe(400);
      expect(missingPassword.body.error).toBe("Missing credentials");

      const missingEmail = await request(app).post("/login").send({ password: "test" });
      expect(missingEmail.status).toBe(400);
      expect(missingEmail.body.error).toBe("Missing credentials");
    });

    it("should reject a request with a nonexistent email", async () => {
      const nonexistentUser = await request(app)
        .post("/login")
        .send({ email: "test2@test.test", password: "test" });
      expect(nonexistentUser.status).toBe(401);
      expect(nonexistentUser.body.error).toBe("Email or Password Incorrect");
    });

    it("should reject a request with an incorrect password", async () => {
      const badPassword = await request(app)
        .post("/login")
        .send({ email: "test@test.test", password: "test2222" });
      expect(badPassword.status).toBe(401);
      expect(badPassword.body.error).toBe("Email or Password Incorrect");
    });

    it("should accept a request with valid credentials", async () => {
      const validLogin = await request(app)
        .post("/login")
        .send({ email: "test@test.test", password: "test" });
      expect(validLogin.status).toBe(200);
      expect(validLogin.body.token).toBeTruthy();
      expect(validLogin.body.refresh).toBeTruthy();
      expect(typeof validLogin.body.token).toBe("string");
      expect(typeof validLogin.body.refresh).toBe("string");
    });
  });

  describe("reset password routes", () => {
    it("should reject a request with missing params", async () => {
      const missingEmail = await request(app).post("/resetPassword").send({});
      expect(missingEmail.status).toBe(400);
      expect(missingEmail.body.error).toBe("Missing credentials");
    });

    it("should return 200 when the email does not exist", async () => {
      const nonexistentEmail = await request(app)
        .post("/resetPassword")
        .send({ email: "nonexistent@test.test" });
      expect(nonexistentEmail.status).toBe(200);
    });

    it("should set tokens when the user does exist", async () => {
      const validEmail = await request(app)
        .post("/resetPassword")
        .send({ email: "test@test.test" });
      expect(validEmail.status).toBe(200);
      User.findOne({ email: "test@test.test" }).then((doc) => {
        const user = doc as UserDocument;
        expect(user.passwordResetToken).toBeTruthy();
        expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
      });
    });
    it("should return 200 when a valid token is requested", async (done) => {
      const validEmail = await request(app)
        .post("/resetPassword")
        .send({ email: "test@test.test" });

      User.findOne({ email: "test@test.test" }).then(async (doc) => {
        const user = doc as UserDocument;
        const validToken = await request(app).get(
          `/resetPassword/${encodeURI(user.passwordResetToken)}`
        );
        expect(user.passwordResetToken).toBeTruthy();
        expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
        expect(validEmail.status).toBe(200);

        expect(validToken.status).toBe(200);
        done();
      });
    });

    // it("should ", () => {});

    it("should return 404 when an invalid token is requested", async () => {
      const invalidToken = await request(app).get("/resetPassword/test");
      expect(invalidToken.status).toBe(404);
    });
  });
});
