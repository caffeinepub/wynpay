# WynPay

## Current State
The Mine screen has menu items including Account Security, Common Problem, and Bind Payment App, but they are not linked to any screens. The current balance section shows balance numbers but no transaction/bonus history. The Screen type and routing exist in App.tsx.

## Requested Changes (Diff)

### Add
- **Account Security screen**: User can change login password by verifying their mobile number (OTP-style: enter phone, get code via toast, verify, set new password)
- **Common Problem screen**: FAQ-style accordion with 3 pre-defined Q&As matching the uploaded image layout (Frequently Asked Questions title, expandable cards with answer text inside gray boxes)
- **Bind Payment App screen**: Users can add UPI IDs for different payment types (PhonePe, Paytm, MobiKwik, FreeCharge) -- each with its own UPI ID field, similar to how Sell RP wallets are managed
- **Current Balance detail screen**: When user taps the current balance area on Mine, opens a full transaction history page showing: buy transactions, bonus/reward history, sell transactions -- all in a tabbed list

### Modify
- Add new screen types: `"account-security"`, `"common-problem"`, `"bind-payment"`, `"balance-history"`
- Wire Account Security, Common Problem, Bind Payment App menu items to their new screens
- Wire the current balance section on Mine to the balance-history screen
- Pass necessary props (phone, registeredUsers, saveUser, upiWallets, setUpiWallets) through navigate/screen system

### Remove
Nothing removed.

## Implementation Plan
1. Add new screen values to Screen type
2. Create AccountSecurityScreen component (enter phone → verify OTP code → set new password)
3. Create CommonProblemScreen component (accordion FAQ list matching image)
4. Create BindPaymentScreen component (add/view UPI IDs per provider)
5. Create BalanceHistoryScreen component (tabs: All / Buy / Bonus / Sell with transaction lists)
6. Wire menu items in MineScreen to navigate to respective screens
7. Make current balance area clickable to navigate to balance-history
8. Add screen rendering in main App component with required props
