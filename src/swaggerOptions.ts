import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Documentation",
      version: "1.0.0",
      description: "Documentation for your API",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.ts"], // Path to your route files
};

export default swaggerOptions;
