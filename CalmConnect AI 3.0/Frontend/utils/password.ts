export const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  if (!password) {
    return 0;
  }

  // Add points for character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Weak if too short, regardless of variety
  if (password.length < 8) {
      // Return 0 if empty, 1 otherwise for short passwords
      return password.length > 0 ? 1 : 0;
  }
  
  // Add a point for sufficient length
  if (password.length >= 8) {
    score++;
  }

  // Map total score (now 1-5) to strength level (1-4)
  if (score < 3) return 1;       // Weak
  if (score === 3) return 2;      // Medium
  if (score === 4) return 3;      // Strong
  if (score >= 5) return 4;       // Very Strong

  return 0; // fallback
};