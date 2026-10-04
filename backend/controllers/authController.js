const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/env");
const { sendTokenResponse, clearTokenCookies, generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const logger = require("../utils/logger");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { username, name, email, password } = req.body;
  const displayName = (username || name || "").trim();

  if (!displayName) {
    return sendError(res, "Username is required", 400);
  }

  if (!email || !email.trim()) {
    return sendError(res, "Email address is required", 400);
  }

  if (!password || password.length < 6) {
    return sendError(res, "Password must be at least 6 characters long", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return sendError(res, "An account with this email address already exists", 409);
  }

  // Create user - strictly assigned normal "user" role by default, never trusting frontend
  const user = await User.create({
    name: displayName,
    username: displayName,
    email: normalizedEmail,
    password,
    role: "user",
    provider: "credentials",
  });

  return sendTokenResponse(res, user, 201, "Account registered successfully");
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Please enter your email and password", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    return sendError(res, "Invalid email or password", 401);
  }

  if (!user.isActive) {
    return sendError(res, "Your account has been deactivated. Please contact support.", 403);
  }

  if (!user.password) {
    return sendError(res, "This account was created using Google. Please continue with Google.", 400);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendError(res, "Invalid email or password", 401);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return sendTokenResponse(res, user, 200, "Logged in successfully");
};

// @desc    Logout user & clear cookies
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  clearTokenCookies(res);
  return sendSuccess(res, "Logged out successfully");
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return sendError(res, "User not found", 404);

  const safeUser = {
    id: user._id.toString(),
    _id: user._id.toString(),
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

  return sendSuccess(res, "Current user fetched", { user: safeUser });
};

// @desc    Refresh session access token
// @route   POST /api/auth/refresh
// @access  Public (via cookie)
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return sendError(res, "No refresh token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      clearTokenCookies(res);
      return sendError(res, "User not found or disabled", 401);
    }

    const newAccessToken = generateAccessToken(user);

    const isProduction = config.NODE_ENV === "production";
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return sendSuccess(res, "Session refreshed", { user });
  } catch (error) {
    clearTokenCookies(res);
    return sendError(res, "Invalid or expired refresh token", 401);
  }
};

// @desc    Initiate Google OAuth redirect
// @route   GET /api/auth/google
// @access  Public
const initiateGoogle = async (req, res) => {
  if (!config.GOOGLE_CLIENT_ID) {
    logger.warn("Google OAuth attempted but GOOGLE_CLIENT_ID is not configured in backend/.env");
    const referer = req.headers.referer || config.FRONTEND_URL;
    return res.redirect(referer);
  }

  const redirectUri = config.GOOGLE_CALLBACK_URL || config.GOOGLE_REDIRECT_URI || `${config.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=select_account`;

  return res.redirect(googleAuthUrl);
};

// @desc    Google OAuth Callback handler (Authorization code exchange)
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    logger.error("Google OAuth error in callback", { error, error_description });
    return res.redirect(`${config.FRONTEND_URL}/auth?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${config.FRONTEND_URL}/auth?error=No_authorization_code_received`);
  }

  try {
    const redirectUri = config.GOOGLE_CALLBACK_URL || config.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";

    // Exchange authorization code with Google token endpoint
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      logger.error("Google token exchange failed", { tokenData });
      return res.redirect(`${config.FRONTEND_URL}/auth?error=Failed_to_exchange_Google_token`);
    }

    // Retrieve verified user info from Google's official userinfo API
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleUser.email) {
      return res.redirect(`${config.FRONTEND_URL}/auth?error=Failed_to_retrieve_Google_profile`);
    }

    const verifiedEmail = googleUser.email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: verifiedEmail });

    if (user) {
      if (!user.isActive) {
        return res.redirect(`${config.FRONTEND_URL}/auth?error=Account_is_deactivated`);
      }
      user.lastLoginAt = new Date();
      if (!user.avatar && googleUser.picture) user.avatar = googleUser.picture;
      if (!user.providerId) user.providerId = googleUser.sub;
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new standard user - NEVER automatically admin
      user = await User.create({
        name: googleUser.name || verifiedEmail.split("@")[0],
        username: verifiedEmail.split("@")[0],
        email: verifiedEmail,
        avatar: googleUser.picture || "",
        provider: "google",
        providerId: googleUser.sub,
        role: "user",
        isVerified: true,
        emailVerified: true,
        lastLoginAt: new Date(),
      });
    }

    // Generate tokens and cookies
    const accessToken = generateAccessToken(user);
    const refreshTokenVal = generateRefreshToken(user);
    const isProduction = config.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshTokenVal, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${config.FRONTEND_URL}/auth?google_token=${accessToken}`);
  } catch (err) {
    logger.error("Error during Google OAuth callback processing", { error: err.message });
    return res.redirect(`${config.FRONTEND_URL}/auth?error=Google_authentication_failed`);
  }
};

// @desc    Direct Google OAuth Token/Credential Verification
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { idToken, credential, code } = req.body;

  const rawToken = idToken || credential;

  let googleUser = null;

  try {
    if (rawToken) {
      // Official Google ID Token validation via Google's tokeninfo API
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${rawToken}`);
      const data = await response.json();

      if (!response.ok || !data.email) {
        return sendError(res, "Invalid or expired Google authentication token", 401);
      }

      // Verify audience if GOOGLE_CLIENT_ID is configured
      if (config.GOOGLE_CLIENT_ID && data.aud && data.aud !== config.GOOGLE_CLIENT_ID) {
        return sendError(res, "Google token audience mismatch", 401);
      }

      googleUser = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        sub: data.sub,
      };
    } else if (code) {
      // Exchange authorization code
      const redirectUri = config.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: config.GOOGLE_CLIENT_ID,
          client_secret: config.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        return sendError(res, "Failed to exchange Google code", 400);
      }

      const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      googleUser = await userinfoResponse.json();
    } else {
      return sendError(res, "Google credentials or ID token is required", 400);
    }

    if (!googleUser || !googleUser.email) {
      return sendError(res, "Could not verify Google user identity", 401);
    }

    const verifiedEmail = googleUser.email.toLowerCase().trim();

    // Check existing user - link Google identity to existing account if found
    let user = await User.findOne({ email: verifiedEmail });

    if (user) {
      if (!user.isActive) {
        return sendError(res, "Your account has been deactivated. Please contact support.", 403);
      }
      user.lastLoginAt = new Date();
      if (!user.avatar && googleUser.picture) user.avatar = googleUser.picture;
      if (!user.providerId) user.providerId = googleUser.sub;
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new standard user - role is ALWAYS "user"
      user = await User.create({
        name: googleUser.name || verifiedEmail.split("@")[0],
        username: verifiedEmail.split("@")[0],
        email: verifiedEmail,
        avatar: googleUser.picture || "",
        provider: "google",
        providerId: googleUser.sub,
        role: "user",
        isVerified: true,
        emailVerified: true,
        lastLoginAt: new Date(),
      });
    }

    return sendTokenResponse(res, user, 200, "Google authentication successful");
  } catch (error) {
    logger.error("Error verifying Google authentication:", error);
    return sendError(res, "Google authentication service error", 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  initiateGoogle,
  googleCallback,
  googleAuth,
};
