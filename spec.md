# WynPay

## Current State
New project. Only scaffold files exist. A wynpay logo has been generated at /assets/generated/wynpay-logo-transparent.dim_512x512.png.

## Requested Changes (Diff)

### Add
- User registration (signup) with phone number + OTP verification
- User login with phone number + OTP verification
- Forgot password / reset password flow with OTP verification
- OTP generation and validation on the backend (6-digit code, expires after 5 minutes)
- User profile storage (name, phone, hashed password)
- Session/auth token management
- A welcome/dashboard screen shown after successful login

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: user store (phone -> profile), OTP store (phone -> {code, expiry}), generateOTP, verifyOTP, registerUser, loginUser, resetPassword endpoints
2. Frontend screens:
   - Splash / landing with wynpay logo
   - Login screen: phone number input -> OTP entry
   - Signup screen: name + phone input -> OTP entry -> password set
   - Forgot password screen: phone input -> OTP entry -> new password
   - Dashboard/home screen after successful auth
3. OTP is simulated (displayed as a toast/alert since SMS is not available on the platform)
