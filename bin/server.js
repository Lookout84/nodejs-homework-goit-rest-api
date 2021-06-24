const app = require("../app");
const db = require("../model/db");
const createFolderIsNotExist = require("../helpers/create-folder");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = process.env.PUBLIC_DIR;
const TMP_DIR = process.env.TMP_DIR;

db.then(() => {
  app.listen(PORT, async () => {
    await createFolderIsNotExist(PUBLIC_DIR);
    await createFolderIsNotExist(TMP_DIR);
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch((error) => {
  console.log(`Error: ${error.message}`);
});
