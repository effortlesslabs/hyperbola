// All SQL queries are centralized here for maintainability.

export const SQL_GET_USER_BY_EMAIL =
  "SELECT id, email, name, avatarUrl, createdAt FROM users WHERE email = ?";

export const SQL_GET_PROVIDERS_BY_USER_ID =
  "SELECT provider, providerId, email FROM userProviders WHERE userId = ?";

export const SQL_GET_USER_ID_BY_PROVIDER =
  "SELECT userId FROM userProviders WHERE provider = ? AND providerId = ?";

export const SQL_GET_USER_BY_ID =
  "SELECT id, email, name, avatarUrl, createdAt FROM users WHERE id = ?";

export const SQL_GET_USER_ID_BY_EMAIL = "SELECT id FROM users WHERE email = ?";

export const SQL_UPDATE_USER_INFO = "UPDATE users SET name = ?, avatarUrl = ? WHERE id = ?";

export const SQL_INSERT_USER =
  "INSERT INTO users (email, name, avatarUrl, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";

export const SQL_GET_PROVIDER_BY_USER_ID_AND_PROVIDER =
  "SELECT id FROM userProviders WHERE userId = ? AND provider = ?";

export const SQL_INSERT_PROVIDER =
  "INSERT INTO userProviders (userId, provider, providerId) VALUES (?, ?, ?)";

export const SQL_UPDATE_PROVIDER_ID = "UPDATE userProviders SET providerId = ? WHERE id = ?";

export const SQL_GET_REFRESH_TOKEN =
  "SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?";
