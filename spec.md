# WynPay - Version 30 → 31

## Current State
- SignupScreen (lines 515–683) has fields: Full Name, Phone, Password, Confirm Password. No invite code field.
- TeamManagementScreen (lines 2780–3111) has Share and QR Code buttons but both are stubs/basic. Share uses Web Share API, QR shows a toast "coming soon".
- No share card/modal showing total earnings, invite code, and mobile number.
- No functional QR code generation.

## Requested Changes (Diff)

### Add
- **Optional Invite Code field in Signup**: Below the phone number field (before password), add an optional "Invite Code" text input. Store the entered referral code with the user account on signup. If the invite code doesn't match any existing user's code, just save it as-is (no hard validation).
- **Share Card in TeamManagementScreen**: When user taps the Share button, instead of directly triggering Web Share API, first show a modal/bottom sheet "Share Card" that displays:
  - App name / WynPay logo at top
  - User's total earnings (same value as account profit balance — sum of rewards earned)
  - User's invite code
  - User's mobile number
  - A "Share" action button that triggers the actual Web Share API or clipboard copy
  - A "Close" button
- **Functional QR Code in TeamManagementScreen**: When user taps the QR Code button, show a modal with a real QR code image that encodes the invite link (https://wynpay-wxx.caffeine.xyz/?inviteCode=USER_CODE). Below the QR code, show a small label "Scan to see my earnings & join WynPay". Use the `qrcode` npm package or generate QR via a public API URL (https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=URL) as an <img> tag — no library needed.

### Modify
- **SignupScreen handleCreate()**: After generating invite code, also capture and store the optional referral/invite code the user entered.
- **TeamManagementScreen Share button onClick**: Change to open share card modal instead of immediately calling navigator.share.
- **TeamManagementScreen QR button onClick**: Change from toast stub to open QR code modal.

### Remove
- Toast stub "QR Code feature coming soon!" in QR button onClick.

## Implementation Plan
1. In SignupScreen JSX, add an optional `inviteCodeInput` state and an input field for "Invite Code (optional)" between phone and password fields. Store it when creating account.
2. In TeamManagementScreen, add state: `showShareCard` (boolean) and `showQRModal` (boolean).
3. Build ShareCard modal component inline — shows earnings, invite code, mobile number, share button.
4. Build QRModal inline — uses `<img src={https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=INVITE_LINK}>` to render QR code. Add label text below.
5. Wire Share button onClick to `setShowShareCard(true)`.
6. Wire QR button onClick to `setShowQRModal(true)`.
7. Pass required props (userName, userPhone, inviteCode, totalEarnings/rewards) into TeamManagementScreen or read from existing props.
