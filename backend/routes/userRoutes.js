const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/submit", userController.submitUser);
router.get("/submissions", userController.getAllUsers);
router.delete("/submissions/:id", userController.deleteUser);
router.put("/submissions/:id", userController.updateUser);

module.exports = router;