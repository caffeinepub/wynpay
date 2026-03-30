# WynPay

## Current State
Forgot password flow has two screens:
1. `forgot-phone` — user enters phone, taps Continue → goes directly to `forgot-password`
2. `forgot-password` — user sets new password → goes to login

No OTP/SMS verification step exists between entering the phone number and resetting the password.

## Requested Changes (Diff)

### Add
- New screen `forgot-otp` between `forgot-phone` and `forgot-password`
- OTP generation logic: when user submits phone on `forgot-phone`, generate a random 6-digit code and display a toast simulating SMS dispatch ("SMS sent to +91XXXXXX: Your code is NNNNNN")
- State: `forgotOtpInput` (what user types), `generatedOtp` (the code generated for verification)
- OTP screen UI: 6-digit OTP input (InputOTP component), resend code button with 30-second cooldown, back button
- Verify OTP: if code matches, navigate to `forgot-password`; if wrong, show error

### Modify
- `Screen` type: add `"forgot-otp"`
- `ForgotPhoneScreen`: change Continue button to "Send Code", on submit generate OTP, show SMS toast, navigate to `forgot-otp` instead of `forgot-password`
- `ForgotPasswordScreen`: back button goes to `forgot-otp` instead of `forgot-phone`
- App state: add `forgotOtpInput`, `generatedOtp` state variables
- App render: wire up the new `ForgotOtpScreen`

### Remove
- Nothing removed

## Implementation Plan
1. Add `"forgot-otp"` to `Screen` type
2. Add state: `forgotOtpInput`, `generatedOtp`
3. Build `ForgotOtpScreen` component with 6-digit OTP input, verify button, resend button (30s cooldown), back navigation
4. Update `ForgotPhoneScreen` Continue → Send Code, generate 6-digit OTP, show SMS toast with code, navigate to `forgot-otp`
5. Update `ForgotPasswordScreen` back to `forgot-otp`
6. Wire `ForgotOtpScreen` into App render block
