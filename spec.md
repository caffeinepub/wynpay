# WynPay

## Current State
The app has: Mine/Profile screen with a 'My team' card that has a non-functional 'View earnings' button. Menu items for Online Service and Official Channel exist but have no links. Newbie Reward screen shows progress bars and a claim button but no tutorial instructions. No team-management screen exists.

## Requested Changes (Diff)

### Add
- New `team-management` Screen type and `TeamManagementScreen` component
  - Blue gradient card: "Yesterday's Rebates" with Top Up (0.0), Purchase 🔒 (0.0), and a calendar widget showing "Team Members: 3"
  - White card: "Today's Rebates" with Top Up (0.0), Purchase (0.0), Team Additions (0)
  - White card: "Invite Link" showing `https://wynpay-wxx.caffeine.xyz/?inviteCode={userInviteCode}` with copy button
  - White card: "More ways" with clickable icons — Telegram (links to https://t.me/wynpayofficls), Facebook, WhatsApp, QR code, Share
  - White card: "Purchase Reward" with teal header table (Type, Profit‰, Scale, DAU) — rows: 1/3.0/2/0, 2/2.0/1/0, 3/1.0/0/0
  - White card: "Top Up Reward" with same teal header table — rows: 1/3.0/1/0, 2/2.0/0/0, 3/1.0/0/0

### Modify
- Mine screen "View earnings" button — navigate to `team-management` screen
- Mine screen: pass `inviteCode` to TeamManagementScreen
- Mine screen Online Service menu item — open Telegram link https://t.me/wynpayservice when clicked
- Mine screen Official Channel menu item — open Telegram link https://t.me/wynpayofficls when clicked
- Newbie Reward screen — add two tutorial instruction cards above the progress section:
  - "1. Task Introduction": card with phone mockup image area + callout text: "You can purchase orders of different levels. After receiving the order, it must be completed within the specified time, otherwise the order will be automatically cancelled."
  - "3. About the Team": card with phone mockup image area + callout text: "Share the invitation code and invite friends to join your team. After your team members complete the order, you will receive a certain percentage of the rebate."
- Screen type union — add `"team-management"`
- Main App render — add `{screen === "team-management" && <TeamManagementScreen .../>}`

### Remove
- Nothing removed

## Implementation Plan
1. Add `"team-management"` to Screen type union
2. Create `TeamManagementScreen` component with all sections matching reference images (blue rebates card, today's rebates, invite link with https://wynpay-wxx.caffeine.xyz/?inviteCode=X, more ways with Telegram/Facebook/WhatsApp/QRcode/Share icons, Purchase Reward table, Top Up Reward table)
3. Wire Mine screen "View earnings" button to navigate("team-management")
4. Pass `inviteCode` prop through to TeamManagementScreen from Mine screen and from main App
5. Update Online Service menu item click handler to open https://t.me/wynpayservice
6. Update Official Channel menu item click handler to open https://t.me/wynpayofficls
7. Update NewcomerBonusScreen to add two instruction tutorial cards (Task Introduction + About the Team)
8. Add TeamManagementScreen to App render block
