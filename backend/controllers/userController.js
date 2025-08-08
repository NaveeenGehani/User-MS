const db = require("../db/db.config");
const {
  namePattern,
  emailPattern,
  agePattern,
  educationPattern,
  validateInput,
} = require("../utils/validation");

exports.submitUser = (req, res) => {
  const { userFirstName, userLastName, userEmail, userAge, userEducation } = req.body;
  const errors = [];

  if (!validateInput(userFirstName, namePattern)) {
    errors.push("First name must start with a capital letter and contain only letters.");
  }
  if (!validateInput(userLastName, namePattern)) {
    errors.push("Last name must start with a capital letter and contain only letters.");
  }
  if (!validateInput(userEmail, emailPattern)) {
    errors.push("Email must be in a valid format.");
  }
  if (!validateInput(userAge, agePattern)) {
    errors.push("Age must be a number between 0 and 120.");
  }
  if (!validateInput(userEducation, educationPattern)) {
    errors.push("Education must be between 2 and 200 characters long and contain only letters.");
  }
  if (errors.length > 0) {
    return res.status(400).json({ status: "error", errors });
  }

  const query = `INSERT INTO users (firstName, lastName, email, age, education) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    query,
    [userFirstName, userLastName, userEmail, userAge, userEducation],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.status(200).json({ status: "success", message: "Form submitted successfully!" });
    }
  );
};

exports.getAllUsers = (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ status: "error", errors: ["Database error"] });
    }
    res.json({ status: "success", results });
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ status: "error", errors: ["Database error"] });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", errors: ["User not found"] });
    }
    res.json({ status: "success", message: "Submission deleted successfully!" });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { userFirstName, userLastName, userEmail, userAge, userEducation } = req.body;

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ status: "error", errors: ["Database error"] });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: "error", errors: ["User not found"] });
    }

    const current = results[0];
    const updatedFirstName = userFirstName || current.firstName;
    const updatedLastName = userLastName || current.lastName;
    const updatedEmail = userEmail || current.email;
    const updatedAge = userAge || current.age;
    const updatedEducation = userEducation || current.education;

    if (!validateInput(updatedFirstName, namePattern)) {
      return res.status(400).json({ status: "error", errors: ["Invalid first name"] });
    }
    if (!validateInput(updatedLastName, namePattern)) {
      return res.status(400).json({ status: "error", errors: ["Invalid last name"] });
    }
    if (!validateInput(updatedEmail, emailPattern)) {
      return res.status(400).json({ status: "error", errors: ["Invalid email"] });
    }
    if (!validateInput(updatedAge, agePattern)) {
      return res.status(400).json({ status: "error", errors: ["Invalid age"] });
    }
    if (!validateInput(updatedEducation, educationPattern)) {
      return res.status(400).json({ status: "error", errors: ["Invalid education"] });
    }

    const query = `UPDATE users SET firstName = ?, lastName = ?, email = ?, age = ?, education = ? WHERE id = ?`;
    db.query(
      query,
      [updatedFirstName, updatedLastName, updatedEmail, updatedAge, updatedEducation, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ status: "error", errors: ["Database error"] });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ status: "error", errors: ["User not found"] });
        }
        res.json({ status: "success", message: "Submission updated successfully!" });
      }
    );
  });
};