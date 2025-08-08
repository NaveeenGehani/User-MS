const namePattern = /^[a-zA-Z]{3,}$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const agePattern = /^(1[01][0-9]|[1-9]?[0-9]|120)$/;
const educationPattern = /^[A-Za-z\s]{2,200}$/;

function validateInput(field, regex) {
  return !!field && regex.test(field);
}

module.exports = {
  namePattern,
  emailPattern,
  agePattern,
  educationPattern,
  validateInput,
};