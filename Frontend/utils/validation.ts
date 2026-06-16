export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  // A simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  if (!username) return false;
  // Username: 3-20 characters, letters, numbers, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};