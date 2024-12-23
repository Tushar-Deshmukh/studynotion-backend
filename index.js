const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const path = require("path");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const courseCategoryRoutes = require("./routes/CourseCategoryRoutes");
const courseRoutes = require("./routes/CourseRoutes");
const courseTopicRoutes = require("./routes/CourseTopicRoutes");
const courseSubTopicRoutes = require("./routes/CourseSubTopicRoutes");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

//load the environment variables
dotenv.config();

//connect to DB
connectDB();

//middleware
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("server is up and running!");
});

// Serve Swagger UI assets manually
app.use(
  "/swagger-ui-assets",
  express.static(path.join(__dirname, "node_modules/swagger-ui-dist"))
);

// Serve Swagger JSON dynamically
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Serve Swagger UI
app.get("/api-docs", (req, res) => {
  res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>API Docs</title>
          <link rel="stylesheet" href="/swagger-ui-assets/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="/swagger-ui-assets/swagger-ui-bundle.js"></script>
          <script src="/swagger-ui-assets/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = function () {
              SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
              });
            };
          </script>
        </body>
      </html>
    `);
});

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api",courseCategoryRoutes);
app.use("/api",courseRoutes);
app.use("/api",courseTopicRoutes);
app.use("/api",courseSubTopicRoutes);



app.listen(PORT, () => {
  console.log(`App started on PORT: ${PORT}`);
});
