import supertest from "supertest";
import { Response } from "supertest";
import { Request } from "supertest";
import UserModel from "../models/userModel";
import { deleteContactById } from "../controllers/deleteCont";
import app from "./server.test";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { passComparer } from "../utils/passencodingAnddecoding";
import { passwordHashing } from "../utils/passencodingAnddecoding";
import ContactModel from "../models/contactModel";
import { generateToken, verifyingToken } from "../utils/token";
import { any } from "joi";
import BlogModel from "../models/blogModel";
import { uploaded } from "../utils/multer";

dotenv.config();

// const request = supertest(app);

beforeAll(async () => {
  const testDbConnection: string = process.env.TEST_DB as string;
  await mongoose.connect(testDbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Login", () => {
  it("should create a new user", async () => {
    const mockUser = {
      username: "peter",
      email: "musa@gmail.com",
      password: "123",
      gender: "M",
    };

    const response: Response = await request
      .post("/brand/user/post/")
      .send(mockUser);

    // expect(response.status).toBe(201);
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

  it("Should login a usereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", async () => {
    const res = await request.post("/brand/user/login").send({
      useremail: "musa@gmail.com",
      password: "123",
    });
  });
});

// create user

it("should create a new user", async () => {
  const mockUser = {
    username: "peter",
    email: "pp@gmail.com",
    password: "123",
    gender: "M",
  };

  const response: Response = await request
    .post("/brand/user/post/")
    .send(mockUser);

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

it("should return 400 if User with this email already exists", async () => {
  const mockUser = {
    username: "peter",
    email: "p@gmail.com",
    password: "123",
    gender: "M",
    // gender is not provided
  };

  const response: Response = await request
    .post("/brand/user/post/")
    .send(mockUser);

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    message: "User with this email already exists",
    data: null,
  });
});

it("should return 500 if user creation fails", async () => {
  jest
    .spyOn(UserModel, "create")
    .mockRejectedValueOnce(new Error("Failed to create user"));

  const mockUser = {
    username: "peter",
    email: "p@gmail.com",
    password: "123",
    gender: "M",
  };

  const response: Response = await request
    .post("/brand/user/post/")
    .send(mockUser);

  expect(response.status).toBe(500); // Expecting status 500 for user creation failure
  expect(response.body).toEqual({
    message: "Failed to signup",
    data: null,
  });
});

it("should return 500 on internal server error", async () => {
  jest.spyOn(UserModel, "create").mockImplementationOnce(() => {
    throw new Error("Internal Server Error");
  });

  const mockUser = {
    username: "peter",
    email: "p@gmail.com",
    password: "123",
    gender: "male",
  };

  const response: Response = await request
    .post("/brand/user/post/")
    .send(mockUser);

  expect(response.status).toBe(500); // Expecting status 500 for internal server error
  expect(response.body).toEqual({
    message: "Internal Server Error",
    data: null,
    theErrorIs: expect.any(String), // You can optionally check the error message
  });
});

// Other tests remain unchanged

//  login

describe("POST /login", () => {
  it("should login and return a token", async () => {
    const testUser: any = {
      email: "peter@gmail.com",
      password: "123",
    };

    // Create the user in the database
    await UserModel.create(testUser);

    // Mock the behavior of UserModel.findOne to return the created user
    jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(testUser as any);

    // Perform the login request
    const response: Response = await request.post("/brand/user/login").send({
      useremail: testUser.email,
      password: testUser.password, // Change to "password" to match the request body in the controller
    });
    const token = testUser.body;

    console.log("+++++++++++++++++++++++++++++++++++++++++++++++>", token);

    // Check the response
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
  it("should return 500 on internal server error during database query", async () => {
    jest
      .spyOn(UserModel, "findOne")
      .mockRejectedValueOnce(new Error("Internal Server Error"));

    const response: Response = await request.post("/brand/user/login").send({
      useremail: "test@example.com",
      userpassword: "testpassword",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal Server Error",
      data: null,
      theErrorIs: "Internal Server Error",
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
});

// multer

app.post("/upload", uploaded, (req, res) => {
  // Handle file upload
  res.json({ files: req.files });
});

const request = supertest(app);

describe("File Upload", () => {
  it("should upload files successfully", async () => {
    // Create a mock file object
    const file = {
      fieldname: "picture", // The fieldname specified in your middleware
      originalname: "test-image.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      destination: "images_container",
      filename: "test-image.jpg",
      path: "/path/to/test-image.jpg",
      size: 1000, // Adjust the file size as needed
    };

    // Perform a POST request with the mock file
    const response = await request.post("/upload").attach("picture", file.path);

    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.files).toHaveLength(1);
    expect(response.body.files[0].fieldname).toBe("picture");
    expect(response.body.files[0].originalname).toBe("test-image.jpg");
    // Add more assertions as needed
  });
});

// BLOGS

dotenv.config();

jest.mock("cloudinary");

describe("Blog API Tests", () => {
  const mockCloudinaryUpload = cloudinary.uploader.upload as jest.Mock;

  beforeAll(() => {
    mockCloudinaryUpload.mockResolvedValue({
      secure_url: "mocked_secure_url",
    });
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("POST /createBlog", () => {
  it("should create a new blog post", async () => {
    const testData = {
      title: "Test Blog",
      description: "This is a test blog post",
      files: {
        image: [
          {
            path: "/path/to/test/image.jpg",
          },
        ],
      },
    };

    const response = await supertest(app)
      .post("/brand/blog/post")
      .send(testData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Blog post created successfully");
    expect(response.body.data.title).toBe(testData.title);
    expect(response.body.data.description).toBe(testData.description);
    expect(response.body.data.image).toBe("mocked_secure_url");
  });

  it("should handle missing image file and return 400 status", async () => {
    const testData = {
      title: "Test Blog",
      description: "This is a test blog post",
    };

    const response = await supertest(app)
      .post("/brand/blog/post")
      .send(testData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Image file is required");
    expect(response.body.data).toBeNull();
  });

  it("should handle errors and return 500 status", async () => {
    jest
      .spyOn(BlogModel, "create")
      .mockRejectedValueOnce(new Error("Mocked create error"));

    const testData = {
      title: "Test Blog",
      description: "This is a test blog post",
      files: {
        image: [
          {
            path: "/path/to/test/image.jpg",
          },
        ],
      },
    };

    const response = await supertest(app).post("/createBlog").send(testData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(response.body.data).toBeNull();
    expect(response.body.theErrorIs).toBe("Mocked create error");
  });
});

describe("DELETE /deleteBlog/:blogId", () => {
  it("should delete a blog post by ID", async () => {
    const testBlog = await BlogModel.create({
      title: "Test Blog",
      description: "This is a test blog post",
      image: "mocked_secure_url",
      comments: [],
      likes: 0,
    });

    const response = await supertest(app)
      .delete(`/brand/blog/delete/${testBlog._id}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Blog post deleted successfully");
    expect(response.body.data.title).toBe("Test Blog");
  });

  it("should handle not found and return 404 status", async () => {
    const response = await supertest(app)
      .delete("/brand/blog/delete/65e052d58c168a8aeeb41d4a")
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Blog post not found");
    expect(response.body.data).toBeNull();
  });

  it("should handle errors and return 500 status", async () => {
    jest
      .spyOn(BlogModel, "findByIdAndDelete")
      .mockRejectedValueOnce(new Error("Mocked delete error"));

    const testBlog = await BlogModel.create({
      title: "Test Blog",
      description: "This is a test blog post",
      image: "mocked_secure_url",
      comments: [],
      likes: 0,
    });

    const response = await supertest(app)
      .delete(`/deleteBlog/${testBlog._id}`)
      .send();

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(response.body.data).toBeNull();
    expect(response.body.theErrorIs).toBe("Mocked delete error");
  });
});

describe("GET /findAllBlogs", () => {
  it("should return all blog posts if available", async () => {
    const testBlogs = [
      {
        title: "Test Blog 1",
        description: "This is test blog post 1",
        image: "mocked_secure_url_1",
        comments: [],
        likes: 0,
      },
      {
        title: "Test Blog 2",
        description: "This is test blog post 2",
        image: "mocked_secure_url_2",
        comments: [],
        likes: 0,
      },
    ];

    await BlogModel.create(testBlogs);

    const response = await supertest(app).get("/brand/blog/gets");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Blog posts found");
    expect(response.body.data).toHaveLength(2);
  });

  it("should handle no blog posts found and return 404 status", async () => {
    const response = await supertest(app).get("/brand/blog/gets");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No blog posts found");
    expect(response.body.data).toBeNull();
  });

  it("should handle errors and return 500 status", async () => {
    jest
      .spyOn(BlogModel, "find")
      .mockRejectedValueOnce(new Error("Mocked find error"));

    const response = await supertest(app).get("/brand/blog/gets");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(response.body.data).toBeNull();
    expect(response.body.theErrorIs).toBe("Mocked find error");
  });
});

describe("GET /findBlog/:blogId", () => {
  it("should return a blog post by ID", async () => {
    const testBlog = await BlogModel.create({
      title: "Test Blog",
      description: "This is a test blog post",
      image: "mocked_secure_url",
      comments: [],
      likes: 0,
    });

    const response = await supertest(app).get(
      `/brand/blog/get/${testBlog._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Blog post found");
    expect(response.body.data.title).toBe("Test Blog");
  });

  it("should handle not found and return 404 status", async () => {
    const response = await supertest(app).get(
      "/brand/blog/get/345678908765435"
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Blog post not found");
    expect(response.body.data).toBeNull();
  });
  it("should handle errors and return 500 status", async () => {
    jest
      .spyOn(BlogModel, "findById")
      .mockRejectedValueOnce(new Error("Mocked findById error"));

    const response = await supertest(app).get(
      "/brand/blog/get/345678908765435"
    );

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(response.body.data).toBeNull();
    expect(response.body.theErrorIs).toBe("Mocked findById error");
  });
});

describe("PUT /updateBlog/:blogId", () => {
  it("should update a blog post by ID", async () => {
    const testBlog = await BlogModel.create({
      title: "Test Blog",
      description: "This is a test blog post",
      image: "mocked_secure_url",
      comments: [],
      likes: 0,
    });

    const updatedData = {
      title: "Updated Test Blog",
      description: "This is an updated test blog post",
      files: {
        image: [
          {
            path: "../../images_container/1709670352870_dairy.jpg",
          },
        ],
      },
    };

    const response = await supertest(app)
      .put(`/updateBlog/${testBlog._id}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Blog post updated successfully");
    expect(response.body.data.title).toBe(updatedData.title);
    expect(response.body.data.description).toBe(updatedData.description);
    expect(response.body.data.image).toBe("mocked_secure_url");
  });

  it("should handle not found and return 404 status", async () => {
    const response = await supertest(app)
      .put("/brand/blog/update/65e47c1fb5929c5df8200000")
      .send({
        title: "Updated Test Blog",
        description: "This is an updated test blog post",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Blog post not found");
    expect(response.body.data).toBeNull();
  });

  it("should handle missing image file and return 400 status", async () => {
    const testBlog = await BlogModel.create({
      title: "Test Blog",
      description: "This is a test blog post",
      image: "mocked_secure_url",
      comments: [],
      likes: 0,
    });

    const response = await supertest(app)
      .put(`/brand/blog/update/${testBlog._id}`)
      .send({
        title: "Updated Test Blog",
        description: "This is an updated test blog post",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Image file is required");
    expect(response.body.data).toBeNull();
  });

  it("should handle errors and return 500 status", async () => {
    jest
      .spyOn(BlogModel, "findByIdAndUpdate")
      .mockRejectedValueOnce(new Error("Mocked findByIdAndUpdate error"));

    const testBlog = await BlogModel.create({
      title: "Test Blog",
      description: "This is a test blog post",
      image: "mocked_secure_url",
      comments: [],
      likes: 0,
    });

    const response = await supertest(app)
      .put(`/brand/blog/update/${testBlog._id}`)
      .send({
        title: "Updated Test Blog",
        description: "This is an updated test blog post",
        files: {
          image: [
            {
              path: "/path/to/updated/image.jpg",
            },
          ],
        },
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(response.body.data).toBeNull();
    expect(response.body.theErrorIs).toBe("Mocked findByIdAndUpdate error");
  });
});

//Find all users

describe("GET /users", () => {
  it("should return an array of users when users are found", async () => {
    // Insert a test user into the database
    const testUser = {
      useremail: "musa@gmail",
      password: "123",
    };

    await UserModel.create(testUser);

    const token = generateToken({
      email: testUser.useremail,
      _id: "6098a31d6d28a44bd8c54a5b", 
    });

    const response: Response = await request
      .get("/brand/user/gets")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Users found",
      data: expect.arrayContaining([
        expect.objectContaining({
          useremail: testUser.useremail,
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
