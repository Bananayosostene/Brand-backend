import supertest from "supertest";
import { Response } from "supertest";
import { Request } from "supertest";
import UserModel from "../models/userModel"
import app from "../index";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { passComparer } from "../utils/passencodingAnddecoding";
import { passwordHashing } from "../utils/passencodingAnddecoding";
import ContactModel from "../models/contactModel";
import { generateToken, verifyingToken } from "../utils/token";
import { any } from "joi";



dotenv.config();
const request = supertest(app);

beforeAll(async () => {
  
  const testDbConnection: string = process.env.TESTDB as string;
  mongoose.connect(testDbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
});

afterAll(async () => {
 
  await mongoose.disconnect();
});

//utils


describe("passwordHashing function", () => {
  it("should hash the password successfully", async () => {
    const password = "testPassword";
    const hashedPassword = await passwordHashing(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword.length).toBeGreaterThan(0);
  });

  it("should throw an error when hashing fails", async () => {
    const password = "testPassword";
    // Mocking bcrypt.hash to simulate an error
    jest
      .spyOn(bcrypt, "hash")
      .mockRejectedValue(new Error("Hashing failed") as never);

    await expect(passwordHashing(password)).rejects.toThrow(
      "Password hashing failed"
    );
  });
});

// test for passComparer function


describe("passComparer function", () => {
  it("should compare passwords successfully", async () => {
    const password = "testPassword";
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await passComparer(password, hashedPassword);
    expect(result).toBe(true);
  });

  it("should return false for mismatched passwords", async () => {
    const password = "testPassword";
    const hashedPassword = await bcrypt.hash("wrongPassword", 10);

    const result = await passComparer(password, hashedPassword);
    expect(result).toBe(false);
  });

  it("should throw an error when comparing fails", async () => {
    const password = "testPassword";
    const hashedPassword = await bcrypt.hash(password, 10);
    // Mocking bcrypt.compare to simulate an error
    jest.spyOn(bcrypt, "compare");
    jest
      .spyOn(bcrypt, "compare")
      .mockRejectedValue(new Error("Comparison failed") as never);

    await expect(passComparer(password, hashedPassword)).rejects.toThrow(
      "Password comparison failed"
    );
  });
});

// test for generateToken and verifyingToken functions


describe("Token functions", () => {
  it("should generate a token successfully", () => {
    const payload = { userId: "12345", userEmail: "test@example.com" };
    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
  });

  it("should verify a valid token successfully", async () => {
    const payload = { userId: "12345", userEmail: "test@example.com" };
    const token = jwt.sign(payload, "mysecret", { expiresIn: "30s" });

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await verifyingToken(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(payload);
  });

  it("should handle invalid token and return 401", async () => {
    const req = { headers: { authorization: "Bearer invalidToken" } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await verifyingToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle missing token and return 401", async () => {
    const req = { headers: {} };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await verifyingToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle token verification failure and return 401", async () => {
    const req = { headers: { authorization: "Bearer invalidToken" } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    jest
      .spyOn(jwt, "verify")
      .mockImplementationOnce((token, secret, callback) => {
        new Error("Token verification failed"), null;
      });

    await verifyingToken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });
});



//CONTACT

//create contact

describe("POST /createContact", () => {
  it("should create a new contact", async () => {
    const testData = {
      name: "John Doe",
      email: "john@example.com",
      message: "Test message",
    };

    const response = await request.post("/brand/contact/post").send(testData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Contact created successfully");
    expect(response.body.data.name).toBe(testData.name);
    expect(response.body.data.email).toBe(testData.email);
    expect(response.body.data.message).toBe(testData.message);

    const savedContact = await ContactModel.findOne({ email: testData.email });
    expect(savedContact).toBeTruthy();
    expect(savedContact?.name).toBe(testData.name);
    expect(savedContact?.email).toBe(testData.email);
    expect(savedContact?.message).toBe(testData.message);
  });
   it("should handle errors and return 500 status", async () => {
     // Mock the ContactModel.save function to throw an error
     jest.spyOn(ContactModel.prototype, "save").mockImplementationOnce(() => {
       throw new Error("Mocked save error");
     });

     const testData = {
       name: "John Doe",
       email: "john@example.com",
       message: "Test message",
     };

     // Use supertest to send a request to the Express app
     const response = await request
       .post("/brand/contact/delete")
       .send(testData);

     // Check if the response is as expected
     expect(response.status).toBe(500);
     expect(response.body.message).toBe("Internal Server Error");
     expect(response.body.data).toBeNull();
     expect(response.body.theErrorIs).toBe("Mocked save error");
   });
});

//delete contact


describe("DELETE /contacts/:contactId", () => {
  it("should delete a contact and return success message", async () => {
    const insertedContact = await ContactModel.create({
      name: "John Doe",
      email: "john@example.com",
      message: "Hello",
    });

    const response: Response = await request.delete(
      `/brand/contact/delete/${insertedContact._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Contact deleted successfully",
      data: insertedContact.toObject(),
    });
  });

  it("should return 404 if contact is not found", async () => {
    const response: Response = await request.delete(
      "/brand/contact/delete/:contactId");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Contact not found",
      data: null,
    });
  });

  it("should return 500 if failed to delete contact", async () => {
    // Create a contact without saving it to the database
    const unsavedContact = new ContactModel({
      name: "John Doe",
      email: "john@example.com",
      message: "Hello",
    });

    const response: Response = await request.delete(
      `//brand/contact/delete/${unsavedContact._id}`
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to delete contact",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    // Force an internal server error by using an invalid contact ID
    const response: Response = await request.delete(
      "//brand/contact/delete/65e015d2c3846e589sd"
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: expect.any(String),
    });
  });
});


//find all contact:

describe("GET /contacts", () => {
  it("should return a list of contacts", async () => {
    // Insert some test contacts into the database
    await ContactModel.create([
      { name: "Sostene", email: "s@gmail.com", message: "Hello" },
      { name: "Bananayo", email: "b@gmail.com", message: "Hi" },
    ]);

    const response: Response = await request.get("/brand/contact/gets");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Contacts found",
      data: expect.arrayContaining([
        expect.objectContaining({
          name: "Sostene",
          email: "s@gmail.com",
          message: "Hello",
        }),
        expect.objectContaining({
          name: "Bananayo",
          email: "b@gmail.com",
          message: "Hi",
        }),
      ]),
    });
  });

  it("should return 404 if no contacts are found", async () => {
    const response: Response = await request.get("/brand/contact/gets");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No contacts found",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(ContactModel, "find").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response: Response = await request.get("/brand/contact/gets");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: expect.any(String),
    });
  });
});

//find one contact

describe("GET /contacts/:contactId", () => {
  it("should return a specific contact by ID", async () => {
    const insertedContact = await ContactModel.create({
      name: "John Doe",
      email: "john@example.com",
      message: "Hello",
    });

    const response: Response = await request.get(
      `/brand/contact/get/${insertedContact._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Contact found",
      data: insertedContact.toObject(),
    });
  });

  it("should return 404 if contact is not found", async () => {
    const response: Response = await request.get(
      "/brand/contact/get/65e349c73f406c95837253f7"
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Contact not found",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    const response: Response = await request.get("/brand/contact/get/5e349c73f406c95837253f");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: expect.any(String),
    });
  });
});



// create user


describe("POST /users", () => {
  it("should create a new user", async () => {
    const mockUser = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    const response: Response = await request.post("/brand/user/post/").send(mockUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Signup successful",
      data: expect.objectContaining({
        username: mockUser.username,
        email: mockUser.email,
      }),
    });

    const storedUser = await UserModel.findOne({ email: mockUser.email });
    expect(storedUser).not.toBeNull();
    expect(storedUser?.username).toBe(mockUser.username);
  });

  it("should return 400 if user with the same email already exists", async () => {
    const existingUser = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    await UserModel.create(existingUser);

    const response: Response = await request
      .post("/brand/user/post")
      .send(existingUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "User with this email already exists",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(UserModel, "create").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response: Response = await request.post("/brand/user/post").send({
      username: "invaliduser",
      email: "invalid@example.com",
      password: "invalidpassword",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to signup",
      data: null,
    });
  });
});


//login

describe("POST /login", () => {
  it("should login and return a token", async () => {
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    await UserModel.create(testUser);

    const response: Response = await request.post("/brand/user/login").send({
      useremail: testUser.email,
      userpassword: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Login successful",
      tokenisthe: expect.any(String),
      data: expect.objectContaining({
        email: testUser.email,
      }),
    });
  });

  it("should return 401 if user with the given email is not found", async () => {
    const response: Response = await request.post("/brand/user/login").send({
      useremail: "nonexistent@example.com",
      userpassword: "somepassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "user with nonexistent@example.com not found",
      data: null,
    });
  });

  it("should return 401 if the password is invalid", async () => {
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    await UserModel.create(testUser);

    const response: Response = await request.post("/brand/user/login").send({
      useremail: testUser.email,
      userpassword: "invalidpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "invalid password",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(UserModel, "findOne").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response: Response = await request.post("/brand/user/login").send({
      useremail: "test@example.com",
      userpassword: "testpassword",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: expect.any(String),
    });
  });
});

//find all users
describe("GET /users", () => {
  it("should return an array of users when users are found", async () => {
    // Insert a test user into the database
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    await UserModel.create(testUser);

    const token = generateToken({
      email: testUser.email,
      _id: "6098a31d6d28a44bd8c54a5b", // A random MongoDB ObjectId
    });

    const response: Response = await request
      .get("/brand/user/gets")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Users found",
      data: expect.arrayContaining([
        expect.objectContaining({
          email: testUser.email,
        }),
      ]),
    });
  });

  it("should return 404 if no users are found", async () => {
    const token = generateToken({
      email: "test@example.com",
      _id: "6098a31d6d28a44bd8c54a5b", // A random MongoDB ObjectId
    });

    const response: Response = await request
      .get("/brand/user/gets")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No users found",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(UserModel, "find").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const token = generateToken({
      email: "test@example.com",
      _id: "6098a31d6d28a44bd8c54a5b", 
    });

    const response: Response = await request
      .get("/brand/user/gets")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: expect.any(String),
    });
  });
});


//find one user

describe("GET /users/:userId", () => {

  it("should return a user with the given ID", async () => {
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    const createdUser = await UserModel.create(testUser);

    const token = generateToken({
      email: createdUser.email,
      _id: createdUser._id,
    });

    const response: Response = await request
      .get(`/brand/user/get/${createdUser._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User found",
      data: expect.objectContaining({
        email: testUser.email,
      }),
    });
  });

  it("should return 404 if no user is found with the given ID", async () => {
    const nonExistentUserId = "6098a31d6d28a44bd8c54a5c"; 

    const token = generateToken({
      email: "test@example.com",
      _id: "6098a31d6d28a44bd8c54a5b", 
    });

    const response: Response = await request
      .get(`/brand/user/get/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(UserModel, "findById").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const token = generateToken({
      email: "test@example.com",
      _id: "6098a31d6d28a44bd8c54a5b", 
    });

    const response: Response = await request
      .get("/brand/user/get/6098a31d6d28a44bd8c54a5c") // A random MongoDB ObjectId
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: expect.any(String),
    });
  });
});


//update user

describe("PUT /users/:userId", () => {
  it("should update a user successfully", async () => {
 
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    const savedUser = await UserModel.create(testUser);

    const token = generateToken({
      email: testUser.email,
      _id: savedUser._id,
    });

    const updatedUserData = {
      email: "updated@example.com",
    };

const response: Response = await request
  .put(`/brand/user/update/${savedUser._id}`)
  .set("Authorization", `Bearer ${token}`)
  .send(updatedUserData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User updated successfully",
      data: expect.objectContaining(updatedUserData),
    });


    const updatedUser = await UserModel.findById(savedUser._id);
    expect(updatedUser?.email).toBe(updatedUserData.email);
  });

  it("should return 404 if the user is not found", async () => {
    const token = generateToken({
      email: "test@example.com",
      _id: "6098a31d6d28a44bd8c54a5b",
    });

    const response: Response = await request
      .put("/brand/user/update/6098a31d6d28a44bd8c54a5b")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "updated@example.com" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(UserModel, "findByIdAndUpdate").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const token = generateToken({
      email: "test@example.com",
      _id: "6098a31d6d28a44bd8c54a5b", 
    });

    const response: Response = await request
      .put("/brand/user/update/6098a31d6d28a44bd8c54a5b")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "updated@example.com" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to update user",
      data: null,
    });
  });
});


//delete user

describe("DELETE /brand/user/delete/:userId", () => {
  it("should delete a user successfully", async () => {
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    const savedUser = await UserModel.create(testUser);

    const token = generateToken({
      email: testUser.email,
      _id: savedUser._id,
    });

    const response: Response = await request
      .delete(`/brand/user/delete/${savedUser._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User deleted successfully",
      data: expect.objectContaining(testUser),
    });

    const deletedUser = await UserModel.findById(savedUser._id);
    expect(deletedUser).toBeNull();
  });

  it("should return 404 if the user is not found", async () => {
    const nonExistentUserId = "6098a31d6d28a44bd8c54a5b";
    const token = generateToken({
      email: "test@example.com",
      _id: "some-valid-id",
    });

    const response: Response = await request
      .delete(`/brand/user/delete/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
    });
  });

  it("should return 500 on internal server error", async () => {
    jest.spyOn(UserModel, "findByIdAndDelete").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const token = generateToken({
      email: "test@example.com",
      _id: "some-valid-id",
    });

    const response: Response = await request
      .delete("/brand/user/delete/some-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to delete user",
      data: null,
    });
  });
});