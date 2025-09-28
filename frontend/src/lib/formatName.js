/**
 * Formats a user's name for display in the navbar
 * @param {Object} user - Firebase user object
 * @returns {string} Formatted name (e.g., "John D" for "John Doe")
 */
export const formatUserName = (user) => {
  if (!user) return "User";

  // If user has displayName, use it
  if (user.displayName) {
    const nameParts = user.displayName.trim().split(" ");
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName} ${lastName.charAt(0).toUpperCase()}`;
    }
    return user.displayName;
  }

  // If no displayName but has email, extract name from email
  if (user.email) {
    const emailName = user.email.split("@")[0];
    // Try to split by common separators
    const nameParts = emailName.split(/[._-]/);
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName} ${lastName.charAt(0).toUpperCase()}`;
    }
    return emailName;
  }

  return "User";
};
