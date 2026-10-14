app.get("/health", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      success: true,
      message: "API is running",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      database: "disconnected"
    });
  }
});