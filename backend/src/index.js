import app from "./app.js";
import { config } from "./config/index.js";

const PORT = config.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
