export function validateLogin({ email, password }) {
  const errors = {};
  if (!email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters";
  return errors;
}

export function validateSignup({ name, email, password, confirmPassword }) {
  const errors = validateLogin({ email, password });
  if (!name || name.trim().length < 2) errors.name = "Full name must be at least 2 characters";
  if (password && confirmPassword && password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
}
