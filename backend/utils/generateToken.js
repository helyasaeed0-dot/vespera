const jwt = require("jsonwebtoken");
const config = require("../config/env");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
    },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES }
  );
};

const sendTokenResponse = (res, user, statusCode = 200, message = "Success") => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const isProduction = config.NODE_ENV === "production";

  // Access token cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  // Refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Never return password or sensitive hashes
  const safeUser = {
    id: user._id || user.id,
    name: user.name,
    username: user.username || user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    provider: user.provider,
    isVerified: user.isVerified,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: safeUser,
      accessToken,
    },
  });
};

const clearTokenCookies = (res) => {
  const isProduction = config.NODE_ENV === "production";
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    expires: new Date(0),
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    expires: new Date(0),
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse,
  clearTokenCookies,
};
