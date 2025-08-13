const supabase = require("../db/supabaseClient.js");
const {
  namePattern,
  emailPattern,
  agePattern,
  educationPattern,
  validateInput,
} = require("../utils/validation");

async function submitUser(req, res) {
  const { userFirstName, userLastName, userEmail, userAge, userEducation } =
    req.body;
  const errors = [];

  if (!validateInput(userFirstName, namePattern)) {
    errors.push(
      "First name must start with a capital letter and contain only letters."
    );
  }
  if (!validateInput(userLastName, namePattern)) {
    errors.push(
      "Last name must start with a capital letter and contain only letters."
    );
  }
  if (!validateInput(userEmail, emailPattern)) {
    errors.push("Email must be in a valid format.");
  }
  if (!validateInput(userAge, agePattern)) {
    errors.push("Age must be a number between 0 and 120.");
  }
  if (!validateInput(userEducation, educationPattern)) {
    errors.push(
      "Education must be between 2 and 200 characters long and contain only letters."
    );
  }
  if (errors.length > 0) {
    return res.status(400).json({ status: "error", errors });
  }
  const { error } = await supabase.from("users").insert({
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
    age: userAge,
    education: userEducation,
  });
  if (error) {
    console.error("Error inserting data:", error);
    return res.status(500).json({ status: "error", message: "Database error" });
  }
  res
    .status(200)
    .json({ status: "success", message: "Form submitted successfully!" });
}

async function getAllUsers(req, res) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: true });
  if (error) {
    return res
      .status(500)
      .json({ status: "error", errors: ["Database error"] });
  }
  if (data.length === 0) {
    return res.status(404).json({ status: "error", errors: error });
  }
  res.json({ status: "success", results: data });
}

async function deleteUser(req, res) {
  const userId = req.params.id;

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId).select("*");
  if (error) {
    return res
      .status(500)
      .json({ status: "error", errors: ["Database error"] });
  }
  /*
  if (!data || data.length === 0) {
    return res
      .status(404)
      .json({ status: "error", errors: ["User not found"] });
  }
  */
  res
    .status(200)
    .json({ status: "success", message: `User deleted successfully! Bye ${data[0]?.firstName || "" }` });
}

// update user
async function updateUser(req, res) {
  const userId = req.params.id;
  const {
    updateFirstName,
    updateLastName,
    updateEmail,
    updateAge,
    updateEducation,
  } = req.body;
  const errors = [];

  const { data, err } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId);
  if (err) {
    return res
      .status(500)
      .json({ status: "error", errors: ["Database error"] });
  }
  if (data.length === 0) {
    return res
      .status(404)
      .json({ status: "error", errors: ["No users found"] });
  }

  const current = data[0];
  const updatedFirstName = updateFirstName || current.firstName;
  const updatedLastName = updateLastName || current.lastName;
  const updatedEmail = updateEmail || current.email;
  const updatedAge = updateAge || current.age;
  const updatedEducation = updateEducation || current.education;

  // Optionally, check if at least one field is being updated
  if (
    !updateFirstName &&
    !updateLastName &&
    !updateEmail &&
    !updateAge &&
    !updateEducation
  ) {
    return res.status(400).json({
      status: "error",
      errors: ["Please provide at least one field to update."],
    });
  }

  // Validation checks
  if (!validateInput(updatedFirstName, namePattern)) {
    return res
      .status(400)
      .json({ status: "error", errors: ["Invalid first name"] });
  }
  if (!validateInput(updatedLastName, namePattern)) {
    return res
      .status(400)
      .json({ status: "error", errors: ["Invalid last name"] });
  }
  if (!validateInput(updatedEmail, emailPattern)) {
    return res.status(400).json({ status: "error", errors: ["Invalid email"] });
  }
  if (!validateInput(updatedAge, agePattern)) {
    return res.status(400).json({ status: "error", errors: ["Invalid age"] });
  }
  if (!validateInput(updatedEducation, educationPattern)) {
    return res
      .status(400)
      .json({ status: "error", errors: ["Invalid education"] });
  }

  const { error } = await supabase
    .from("users")
    .update({
      firstName: updatedFirstName,
      lastName: updatedLastName,
      email: updatedEmail,
      age: updatedAge,
      education: updatedEducation,
    })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ status: "error", message: "Database error" });
  }
  res
    .status(200)
    .json({ status: "success", message: "User updated successfully!" });
}

module.exports = {
  submitUser,
  getAllUsers,
  deleteUser,
  updateUser,
};
