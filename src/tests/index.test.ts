import supertest from "supertest";
import app from "../index";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { passComparer } from "../utils/passencodingAnddecoding";
import { passwordHashing } from "../utils/passencodingAnddecoding";
import ContactModel from "../models/contactModel";



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

describe("API Tests", () => {
  it("GET / should return a welcome message", async () => {
    const response = await request.get("/");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to our first api ");
  });


  it("POST /todoapi/createtodo should create a new todo", async () => {
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    };

    const response = await request.post("/todoapi/createtodo").send(todoData);
    expect(response.status).toBe(200);
    // expect(response.body).toHaveProperty("message");
    // expect(response.body).toHaveProperty("data");
  });

  it("POST /api/users/signup should create a new user", async () => {
    const userData = {
      email: "sbGmail.com.com",
      password: "123",
    };

    const response = await request.post("/users/createuser").send(userData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("message");
  });
  it("POST /todoapi/createtodo should create a new todo", async () => {
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    }
      const response = await request.post("/todoapi/createtodo").send(todoData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Todo created successfully"
      );
      expect(response.body).toHaveProperty("data.title", todoData.title);
      expect(response.body).toHaveProperty(
        "data.description",
        todoData.description
      );
  })
    ;
  
  

});


describe("creatingtodo API endpoint", () => {
  beforeAll(async () => {
    // Connect to the test database
    const testDbConnection: string = process.env.TESTDB as string;
    await mongoose.connect(testDbConnection, {
      useNewUrlParser: true, // This line is fine
      useUnifiedTopology: true,
    } as any);
  });

  afterAll(async () => {
    // Disconnect from the test database after all tests
    await mongoose.disconnect();
  });

  it("should create a new todo", async () => {
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    };

    const response = await request.post("/todoapi/createtodo").send(todoData);

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task added correctly");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("_id");
    expect(response.body.data.title).toBe(todoData.title);
    expect(response.body.data.description).toBe(todoData.description);
    expect(response.body.data.dueDate).toBe(todoData.dueDate);
  });

  it("should handle failure to create a todo", async () => {
    // Assuming some condition that leads to a failure in creating the todo
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    };

    // Mock a failure scenario (e.g., by modifying the TodoTask model)
    jest.spyOn(mongoose.Model, "create").mockImplementationOnce(() => {
      throw new Error("Some error occurred");
    });

    const response = await request.post("/todoapi/createtodo").send(todoData);

    // Check response status and structure
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to add task");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("theErrorIs");
  });
});

describe("deleteById API endpoint", () => {
  let testTodoId: string;

  beforeAll(async () => {
    // Connect to the test database
    const testDbConnection: string = process.env.TESTDB as string;
    await mongoose.connect(testDbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);

    // Create a test todo to be used in the tests
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    };

    const response = await request.post("/todoapi/createtodo").send(todoData);
    testTodoId = response.body.data._id;
  });

  afterAll(async () => {
    // Disconnect from the test database after all tests
    await mongoose.disconnect();
  });

  it("should delete a todo by ID", async () => {
    const response = await request.delete(`/todoapi/delete/${testTodoId}`);

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task deleted successfully");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("_id", testTodoId);
  });

  it("should handle not finding a todo by ID", async () => {
    // Assuming some non-existing ID
    const nonExistingId = "nonexistentid";

    const response = await request.delete(`/todoapi/delete/${nonExistingId}`);

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task not found");
    expect(response.body).toHaveProperty("data", null);
  });

  it("should handle failure to delete a todo by ID", async () => {
    // Mock a failure scenario (e.g., by modifying the TodoTask model)
    jest.spyOn(mongoose.Model, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Some error occurred");
    });

    const response = await request.delete(`/todoapi/delete/${testTodoId}`);

    // Check response status and structure
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to delete task");
    expect(response.body).toHaveProperty("data", null);
  });
});

describe("findAll API endpoint", () => {
  beforeAll(async () => {
    // Connect to the test database
    const testDbConnection: string = process.env.TESTDB as string;
    await mongoose.connect(testDbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);
  });

  afterAll(async () => {
    // Disconnect from the test database after all tests
    await mongoose.disconnect();
  });

  it("should find all tasks", async () => {
    // Assuming there are some tasks in the database
    const response = await request.get("/todoapi/findall");

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Tasks found");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should handle case where no tasks are found", async () => {
    // Assuming the database is empty
    // Clear existing tasks
    await mongoose.connection.db.dropCollection("todotasks");

    const response = await request.get("/todoapi/findall");

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "No tasks found");
    expect(response.body).toHaveProperty("data", null);
  });

  it("should handle failure to find tasks", async () => {
    // Mock a failure scenario (e.g., by modifying the TodoTask model)
    jest.spyOn(mongoose.Model, "find").mockImplementationOnce(() => {
      throw new Error("Some error occurred");
    });

    const response = await request.get("/todoapi/findalltodo");

    // Check response status and structure
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal Server Error");
    expect(response.body).toHaveProperty("data", null);
  });
});

describe("findtaskById API endpoint", () => {
  let testTodoId: string;

  beforeAll(async () => {
    // Connect to the test database
    const testDbConnection: string = process.env.TESTDB as string;
    await mongoose.connect(testDbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);

    // Create a test todo to be used in the tests
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    };

    const response = await request.post("/todoapi/createtodo").send(todoData);
    testTodoId = response.body.data._id;
  });

  afterAll(async () => {
    // Disconnect from the test database after all tests
    await mongoose.disconnect();
  });

  it("should find a task by ID", async () => {
    const response = await request.get(`/todoapi/find/${testTodoId}`);

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task found");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("_id", testTodoId);
  });

  it("should handle case where task is not found by ID", async () => {
    // Assuming some non-existing ID
    const nonExistingId = "nonexistentid";

    const response = await request.get(`/todoapi/find/${nonExistingId}`);

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task not found");
    expect(response.body).toHaveProperty("data", null);
  });

  it("should handle failure to find a task by ID", async () => {
    // Mock a failure scenario (e.g., by modifying the TodoTask model)
    jest.spyOn(mongoose.Model, "findById").mockImplementationOnce(() => {
      throw new Error("Some error occurred");
    });

    const response = await request.get(`/todoapi/find/${testTodoId}`);

    // Check response status and structure
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal Server Error");
    expect(response.body).toHaveProperty("data", null);
  });
});

describe("updatethetask API endpoint", () => {
  let testTodoId: string;

  beforeAll(async () => {
    // Connect to the test database
    const testDbConnection: string = process.env.TESTDB as string;
    await mongoose.connect(testDbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }as any);

    // Create a test todo to be used in the tests
    const todoData = {
      title: "Test Todo",
      description: "Test Todo content",
      dueDate: "2024-12-31",
    };

    const response = await request.post("/todoapi/createtodo").send(todoData);
    testTodoId = response.body.data._id;
  });

  afterAll(async () => {
    // Disconnect from the test database after all tests
    await mongoose.disconnect();
  });

  it("should update a task by ID", async () => {
    const updatedData = {
      title: "Updated Todo",
      description: "Updated Todo content",
      dueDate: "2025-01-31",
    };

    const response = await request
      .put(`/todoapi/update/${testTodoId}`)
      .send(updatedData);

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      "Task updated successfully"
    );
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("_id", testTodoId);
    expect(response.body.data.title).toBe(updatedData.title);
    expect(response.body.data.description).toBe(updatedData.description);
    expect(response.body.data.dueDate).toBe(updatedData.dueDate);
  });

  it("should handle case where task is not found for update", async () => {
    // Assuming some non-existing ID
    const nonExistingId = "nonexistentid";

    const response = await request
      .put(`/todoapi/update/${nonExistingId}`)
      .send({ title: "Updated Todo" });

    // Check response status and structure
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task not found");
    expect(response.body).toHaveProperty("data", null);
  });

  it("should handle failure to update a task by ID", async () => {
    // Mock a failure scenario (e.g., by modifying the TodoTask model)
    jest
      .spyOn(mongoose.Model, "findByIdAndUpdate")
      .mockImplementationOnce(() => {
        throw new Error("Some error occurred");
      });

    const response = await request
      .put(`/todoapi/update/${testTodoId}`)
      .send({ title: "Updated Todo" });

    // Check response status and structure
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to update task");
    expect(response.body).toHaveProperty("data", null);
  });
});


//index1

describe("Todo API Testing", () => {
  let createdTodoId: string;

  it("should create a new todo and return success", async () => {
    const todoData = { title: "Test Todo", description: "Test Description" };

    const response = await request.post("/api/todos/createtodo").send(todoData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Task added correctly");
    expect(response.body).toHaveProperty("data");
    createdTodoId = response.body.data.id;
  });

  it("should find the created todo by ID and return success", async () => {
    const response = await request.get(
      `/api/todos/findtodoid/${createdTodoId}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Task found");
    expect(response.body).toHaveProperty("data");
  });

  it("should delete the created todo by ID and return success", async () => {
    const response = await request.delete(
      `/api/todos/deletetodoid/${createdTodoId}`
    );

    expect(response.status).toBe(200);
    // expect(response.body).toHaveProperty(
    //   "message",
    //   "Task deleted successfully"
    // );
    expect(response.body).toHaveProperty("data");
  });

  it("should find all todos and return success", async () => {
    const response = await request.get("/api/todos/findalltodo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Tasks found");
    expect(response.body).toHaveProperty("data");
  });

  it("should update the created todo and return success", async () => {
    const updatedTodoData = {
      title: "Updated Todo",
      description: "Updated Description",
    };

    const response = await request
      .put(`/api/todos/updatetodo/${createdTodoId}`)
      .send(updatedTodoData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Task updated successfully"
    );
    expect(response.body).toHaveProperty("data");
  });
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

// test for tokengenerating and verifyingtoken functions
import { tokengenerating, verifyingtoken } from "../utils/token";
import { any } from "joi";

describe("Token functions", () => {
  it("should generate a token successfully", () => {
    const payload = { userId: "12345", userEmail: "test@example.com" };
    const token = tokengenerating(payload);
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
  });

  it("should verify a valid token successfully", async () => {
    const payload = { userId: "12345", userEmail: "test@example.com" };
    const token = jwt.sign(payload, "mysecret", { expiresIn: "30s" });

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await verifyingtoken(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(payload);
  });

  it("should handle invalid token and return 401", async () => {
    const req = { headers: { authorization: "Bearer invalidToken" } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await verifyingtoken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle missing token and return 401", async () => {
    const req = { headers: {} };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await verifyingtoken(req as any, res as any, next);

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

    await verifyingtoken(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });
});



//message


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
     const response = await request.post("/createContact").send(testData);

     // Check if the response is as expected
     expect(response.status).toBe(500);
     expect(response.body.message).toBe("Internal Server Error");
     expect(response.body.data).toBeNull();
     expect(response.body.theErrorIs).toBe("Mocked save error");
   });
});