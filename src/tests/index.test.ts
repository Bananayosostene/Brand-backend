import request from "supertest";
import mongoose from "mongoose";
import BlogModel from "../models/blogModel";
import UserModel from "../models/userModel";
import ContactModel from "../models/contactModel";

import app from "../index"; // Import the Express app

describe("App", () => {
  beforeAll(async () => {
    // Connect to the test database before running the tests
    await mongoose.connect("mongodb://localhost:27017/MyBrandTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  });

  afterAll(async () => {
    // Disconnect from the test database after running the tests
    await mongoose.connection.close();
  });

  it("should connect to the database and start the server", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Database connected successfully");
  });
});



//blog

describe("BlogModel", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/MyBrandTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new blog instance", async () => {
    const blogData = {
      image: "test-image-url",
      title: "Test Blog",
      description: "This is a test blog",
      comments: [],
      likes: 0,
    };

    const blog = await BlogModel.create(blogData);
    expect(blog).toMatchObject(blogData);
  });
});

describe("BlogModel", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/MyBrandTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new blog instance", async () => {
    const blogData = {
      image: "test-image-url",
      title: "Test Blog",
      description: "This is a test blog",
      comments: [],
      likes: 0,
    };

    const blog = await BlogModel.create(blogData);
    expect(blog).toMatchObject(blogData);
  });
});


//contact model

describe("ContactModel", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/MyBrandTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new contact instance with a default createdAt value", async () => {
    const contactData = {
      name: "Test User",
      email: "test@example.com",
      message: "This is a test message",
    };

    const contact = await ContactModel.create(contactData);
    expect(contact).toMatchObject({
      ...contactData,
      createdAt: expect.any(String),
    });
  });
});



// user  model

describe("UserModel", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/MyBrandTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new user instance", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    const user = await UserModel.create(userData);
    expect(user).toMatchObject(userData);
  });
});


//login

describe("Login", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/MyBrandTest", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should log in a user with valid credentials", async () => {
    // Create a test user
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    await UserModel.create(userData);

    // Attempt to log in with the test user's credentials
    const response = await request(app).post("/login").send({
      useremail: "test@example.com",
      userpassword: "testpassword",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Login successful");
    expect(response.body).toHaveProperty("tokenisthe");
    expect(response.body).toHaveProperty("data");
  });

  it("should return an error for invalid credentials", async () => {
    const response = await request(app).post("/login").send({
      useremail: "nonexistentuser@example.com",
      userpassword: "invalidpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "invalid password");
    expect(response.body).toHaveProperty("data", null);
  });

  it("should return an error for a non-existent user", async () => {
    const response = await request(app).post("/login").send({
      useremail: "nonexistentuser@example.com",
      userpassword: "testpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "user with nonexistentuser@example.com not found"
    );
    expect(response.body).toHaveProperty("data", null);
  });


  describe("Blog Controller Tests", () => {
    let createdBlogId: string;

    // Create a new blog post
    it("should create a new blog post", async () => {
      const response = await request(app)
        .post("/brand/createBlog")
        .field("title", "Test Blog")
        .field("description", "This is a test blog")
        .attach("image", "path/to/test-image.jpg"); // Replace with the actual path to your test image

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Blog post created successfully");
      expect(response.body.data).toHaveProperty("_id");
      createdBlogId = response.body.data._id;
    });

    // Get all blogs
    it("should get all blog posts", async () => {
      const response = await request(app).get("/brand/findAllBlogs");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Blog posts found");
      expect(response.body.data).toBeInstanceOf(Array);
    });

    // Get one blog by ID
    it("should get one blog post by ID", async () => {
      const response = await request(app).get(
        `/brand/findBlogById/${createdBlogId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Blog post found");
      expect(response.body.data).toHaveProperty("_id", createdBlogId);
    });

    // Update a blog post
    it("should update a blog post by ID", async () => {
      const response = await request(app)
        .put(`/brand/updateBlogById/${createdBlogId}`)
        .send({ title: "Updated Test Blog" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Blog post updated successfully");
      expect(response.body.data).toHaveProperty("_id", createdBlogId);
      expect(response.body.data.title).toBe("Updated Test Blog");
    });

    // Delete a blog post
    it("should delete a blog post by ID", async () => {
      const response = await request(app).delete(
        `/brand/deleteBlogById/${createdBlogId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Blog post deleted successfully");
      expect(response.body.data).toHaveProperty("_id", createdBlogId);
    });
  });
});