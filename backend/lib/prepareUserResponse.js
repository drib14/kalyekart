/**
 * Prepares a user object for a safe API response.
 * This function converts a Mongoose document to a plain object
 * and removes sensitive fields.
 * @param {object} user - The Mongoose user document.
 * @returns {object|null} A safe user object for API responses, or null if no user is provided.
 */
export const prepareUserResponse = (user) => {
	if (!user) return null;

	const userObject = user.toObject();

	// Remove sensitive or unnecessary fields
	delete userObject.password;
	delete userObject.passwordResetCode;
	delete userObject.passwordResetExpires;

	return userObject;
};