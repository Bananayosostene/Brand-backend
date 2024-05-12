import supertest from "supertest";
import { Response } from "supertest";
import { Request } from "supertest";
import { deleteContactById } from "../controllers/deleteCont";
import app from "./server.test";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import BlogModel from "../models/blogModel";
import jwt from "jsonwebtoken";
import { passComparer } from "../utils/passencodingAnddecoding";
import { passwordHashing } from "../utils/passencodingAnddecoding";
import ContactModel from "../models/contactModel";
import { generateToken, verifyingToken } from "../utils/token";
import { uploaded } from "../utils/multer";
import { findBlogById } from "../controllers/findOneBlog";
import UserModel from './../models/userModel';

dotenv.config();

const request = supertest(app);

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

describe("Auth", () => {
  let token:any
  it("should create a new user", async () => {
    const mockUser = {
      username: "Sostene",
      email: "sostene@gmail.com",
      password: "123",
      role: "admin",
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

  it("Should login a user", async () => {
    const res = await request.post("/brand/user/login").send({
      useremail: "sostene@gmail.com",
      password: "123",
    });
    token = res.body;
  // console.log(" T ooooooooooooooooooooooooooooooooooooooooooo ", token);
  });

  


  it("Should get a single user", async () => {
    const res = await request.post("/brand/user/login").send({
      useremail: "sostene@gmail.com",
      password: "123",
    });
    token = res.body;
    // console.log("Tooooooooooooooooooooooooooooooooooooooooooo", token);

    const user = new UserModel({
      username: "peter",
      email: "peter1@gmail.com",
      password: "123",
      gender: "M",
    });

     await user.save();

    const singleUserResponse = await request
      .get(`/bland/user/get/${user._id}`)
      .set("Authorization", `Bearer ${token}`);
    // console.log("====================================",user._id );
    // console.log(singleUserResponse.body);
    await UserModel.findByIdAndDelete(user._id)
  });
});

// create user

it("should return 400 if User with this email already exists", async () => {
  const mockUser = {
    username: "Sostene",
      email: "sostene@gmail.com",
      password: "123",
      role: "admin",
      gender: "M",
  };

  const response: Response = await request
    .post("/brand/user/post/")
    .send(mockUser);

  expect(response.status).toBe(409);
  expect(response.body).toEqual({
    message: "User with this email already exists",
    data: null,
  });
});

it("should return 500 if user creation fails", async () => {
  jest
    .spyOn(UserModel, "create")
    .mockRejectedValueOnce(new Error("Failed to signup"));

  const mockUser = {
    username: "peter",
    email: "pe@gmail.com",
    password: "123",
    gender: "M",
  };

  const response: Response = await request
    .post("/brand/user/post/")
    .send(mockUser);

  expect(response.status).toBe(500); 
  expect(response.body).toEqual({
    message: "Failed to signup",
    data: null,
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

    await UserModel.create(testUser);

    jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(testUser as any);

    const response: Response = await request.post("/brand/user/login").send({
      useremail: testUser.email,
      password: testUser.password,
    });
    const token = testUser.body;

    // console.log("+++++++++++++++++++++++++++++++++++++++++++++++>", token);

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
      useremail: "bananayo@gmail.com",
      userpassword: "123",
    });

    expect(response.status).toBe(401);
  });
});
 


//Find all users

describe("GET /users", () => {
  let token: any
  it("should return an array of users when users are found", async () => {
    const res = await request.post("/brand/user/login").send({
      useremail: "sostene@gmail.com",
      password: "123",
    });
    token = res.body.tokenisthe;
    console.log("++++++++++++++++++++++++++++++++", token);
    console.log("===============================", res.body.data.username);
    
    const user = new UserModel({
      username: "peter",
      email: "peter@gmail.com",
      password: "123",
      role: "user",
      gender: "M",
    });

    await user.save();

    const response: Response = await request
      .get("/brand/user/gets")
      .set("Authorization", `Bearer ${token}`);
    //  const users = await UserModel
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Users found",
      data: user,
    });
    await UserModel.findByIdAndDelete(user._id)
  });

  it("should return 404 if no users are found", async () => {
   
    const response: Response = await request
      .get("/brand/user/gets")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No users found",
      data: null,
    });
  });
});

// delete and update user

describe("Find One User By ID", () => {
  let token: any
  it("should return a user when a valid user ID is provided", async () => {
    const res = await request.post("/brand/user/login").send({
      useremail: "sostene@gmail.com",
      password: "123",
    });
    token = res.body.tokenisthe;

     console.log("?????????????????????????", token);
     console.log("///////////////////////////", res.body.data.username);

    const user = new UserModel({
      username: "peter",
      email: "peter@gmail.com",
      password: "123",
      role: "user",
      gender: "M",
    });

    await user.save();

    const response: Response = await request
      .get(`/bland/user/get/${user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User found",
      data: user,
    });

    await UserModel.findByIdAndDelete(user._id);
  });

  it("should return 404 if no user is found with the provided ID", async () => {
    const invalidUserId = "60cb62b452fd3d32683c20a1"; 

    const response: Response = await request
      .get(`/bland/user/get/${invalidUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
    });
  });
});

describe("Update User", () => {
  let token: any;
  it("should update a user when a valid user ID and update data are provided", async () => {
       const res = await request.post("/brand/user/login").send({
         useremail: "sostene@gmail.com",
         password: "123",
       });
    token = res.body.tokenisthe;
    
    const user = new UserModel({
      username: "peter",
      email: "peter@gmail.com",
      password: "123",
      role: "user",
      gender: "M",
    });

    await user.save();

    const updatedUserData = {
      username: "updatedPeter",
      email: "updatedpeter@gmail.com",
    };

    const response: Response = await request
      .put(`/bland/user/update/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUserData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User updated successfully",
      data: expect.objectContaining({
        username: updatedUserData.username,
        email: updatedUserData.email,
      }),
    });

    await UserModel.findByIdAndDelete(user._id);
  });

  it("should return 404 if no user is found with the provided ID while updating", async () => {
    const invalidUserId = "60cb62b452fd3d32683c20a1"; // Assuming this ID does not exist
    const updatedUserData = {
      username: "updatedPeter",
      email: "updatedpeter@gmail.com",
    };

    const response: Response = await request
      .put(`/bland/user/update/${invalidUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUserData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
    });
  });
});

describe("Delete User", () => {
  let token: any
 it("should delete a user when a valid user ID is provided", async () => {
   const res = await request.post("/brand/user/login").send({
     useremail: "sostene@gmail.com",
     password: "123",
   });
   token = res.body.tokenisthe;

   console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", token);

   const user = new UserModel({
     username: "peter",
     email: "peter@gmail.com",
     password: "123",
     role: "user",
     gender: "M",
   });

   await user.save();

   const response: Response = await request
     .delete(`/bland/user/delete/${user._id}`)
     .set("Authorization", `Bearer ${token}`);

   expect(response.status).toBe(200);
   expect(response.body).toEqual({
     message: "User deleted successfully",
     data: user,
   });
 });

  it("should return 404 if no user is found with the provided ID while deleting", async () => {
    const invalidUserId = "60cb62b452fd3d32683c20a1"; // Assuming this ID does not exist

    const response: Response = await request
      .delete(`/bland/user/delete/${invalidUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
    });
  });
});















// BLOGS

describe("Blog API Tests", () => {
  let token: any;

  it("Should return 409 if Blog title and content already exist", async () => {
    const userData = await request.post("/brand/user/login").send({
      useremail: "sostene@gmail.com",
      password: "123",
    });

    token = userData.body.tokenisthe;

    const blogData = {
      title: "Test t blog",
      description: "Test t blog content",
    };

    const res = await supertest(app)
      .post("/api/blog")
      .set("Authorization", `Bearer ${token}`)
      .send(blogData);

    expect(res.status).toBe(409);
    expect(res.body.status).toEqual("fail");
    expect(res.body.message).toBeDefined();
  });

  it("Should create a new blog post", async () => {
    const blogData = {
      image: "image.png",
      title: "Test Blog",
      description: "This is a test blog post",
    };

    const response = await supertest(app)
      .post("/brand/blog/post")
      .set("Authorization", `Bearer ${token}`)
      .send(blogData);

    expect(response.status).toBe(201);
    expect(response.body.status).toEqual("success");
    expect(response.body.data.title).toEqual(blogData.title);
    expect(response.body.data.description).toEqual(blogData.description);
    expect(response.body.data.image).toEqual("mocked_secure_url");
  });

  // Other test cases...
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
  
  
  describe("DELETE /deleteBlog/:blogId", () => {
    let token: any;
    it("should delete a blog post by ID", async () => {
          const userData = await request.post("/brand/user/login").send({
            useremail: "sostene@gmail.com",
            password: "123",
          });
  
          token = userData.body.tokenisthe;
      const testBlog = await BlogModel.create({
        title: "Test Blog",
        description: "This is a test blog post",
        image: "mocked_secure_url",
        comments: [],
        likes: 0,
      });
  
      const response = await supertest(app)
        .delete(`/brand/blog/delete/${testBlog._id}`)
        .set("Authorization", `Bearer ${token}`)
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
