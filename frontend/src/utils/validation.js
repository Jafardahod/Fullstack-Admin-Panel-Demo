// frontend/src/utils/validation.js

export const patterns = {
  userId: /^[A-Z0-9]{3,20}$/,
  username: /^[a-zA-Z0-9._-]{3,20}$/,
  fullName: /^[A-Za-z][A-Za-z\s]{1,58}[A-Za-z]$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  mobile: /^[0-9]{7,15}$/,
  pincode: /^[0-9]{4,10}$/,
  itemName: /^.{3,100}$/,
  itemType: /^[A-Za-z0-9\s]{3,50}$/,
  price: /^(?!0\d)\d{1,9}(\.\d{1,2})?$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export const validateUserForm = (form) => {
  const errors = {};

  if (!patterns.userId.test(form.userId))
    errors.userId = "User ID must be 3–20 uppercase letters/numbers.";

  if (!patterns.username.test(form.username))
    errors.username =
      "Username 3–20 chars, letters, numbers, dot, underscore or hyphen.";

  if (!patterns.fullName.test(form.fullName))
    errors.fullName = "Full name should contain only letters and spaces.";

  if (!patterns.email.test(form.email))
    errors.email = "Enter a valid email address.";

  if (!patterns.mobile.test(form.mobile))
    errors.mobile = "Mobile must be 7–15 digits.";

  if (!form.country) errors.country = "Please select a country.";
  if (!form.state) errors.state = "Please select a state.";
  if (!form.city) errors.city = "Please select a city.";

  if (!patterns.pincode.test(form.pincode))
    errors.pincode = "Pincode must be 4–10 digits.";

  if (!form.address || form.address.trim().length < 5)
    errors.address = "Address must be at least 5 characters.";

  // password only on create
  if (!form.editing && !patterns.password.test(form.password))
    errors.password =
      "Password must be 8+ chars with upper, lower, number & special char.";

  return errors;
};

export const validateItemForm = (form) => {
  const errors = {};

  if (!patterns.itemName.test(form.itemName))
    errors.itemName = "Item name must be 3–100 characters.";

  if (!patterns.price.test(form.itemPrice))
    errors.itemPrice = "Enter a valid price (max 2 decimal places).";

  if (!patterns.itemType.test(form.itemType))
    errors.itemType =
      "Item type should be 3–50 characters (letters, numbers, spaces).";

  return errors;
};
