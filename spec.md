# WynPay

## Current State
- Buy RP screen has a list button (TrendingUp icon) that doesn't navigate anywhere
- Sell RP screen has a "Record" button that opens a bottom-sheet modal for transaction records with a basic empty state
- Both screens lack dedicated record pages matching the user's reference screenshots

## Requested Changes (Diff)

### Add
- `BuyRPRecordScreen` — full screen with white header, title "Buy RP record", back arrow, horizontal tab bar with tabs: Unfinished | Bank lock | Locked | Success | Fail (active tab has green underline), and an empty state (clipboard SVG illustration + "There are currently no orders" gray text centered on gray background)
- `SellRPRecordScreen` — full screen with same layout, title "Sell RP record", tabs: Unknown order | Unfinished | Bank lock | Locked | Success
  - In the "Unknown order" tab: random sell orders (Rs. 100–2000) appear automatically every 2 minutes
  - Each order card shows: amount, a countdown timer (2:00 → 0:00), and an Accept button
  - When the 2-minute timer expires, the order disappears from the list
  - If user's rpCoins balance < 100, Accept button is disabled and shows "Min. ₹100 balance" tooltip/message
  - The accepted orders move to "Unfinished" tab
- "buy-rp-record" and "sell-rp-record" to the Screen union type
- ClipboardEmptyState inline SVG component matching screenshot (clipboard with paper, small paper plane and cloud, gray/blue tones)

### Modify
- BuyRPScreen: TrendingUp icon button in header should navigate to "buy-rp-record"
- SellRPScreen: "Record" button should navigate to "sell-rp-record" instead of opening the modal
- Main App: render BuyRPRecordScreen and SellRPRecordScreen with appropriate props
- Pass rpCoins to SellRPRecordScreen for balance check

### Remove
- SellRPScreen's `showRecords` state and the records bottom-sheet modal JSX

## Implementation Plan
1. Add "buy-rp-record" | "sell-rp-record" to the Screen type
2. Create ClipboardEmptyState SVG component (inline, no external file needed)
3. Create BuyRPRecordScreen: white bg, back button → navigate("buy-rp"), tab bar with green underline indicator, empty state for all tabs
4. Create SellRPRecordScreen:
   - Same tab structure as above with 5 tabs
   - useEffect with setInterval every 120 seconds to generate a new random sell order and add it to state with a createdAt timestamp
   - Each rendered order uses another interval/useEffect to count down; when remaining time hits 0, filter out from state
   - Accept button: disabled if rpCoins < 100; on click moves order to acceptedOrders array (shown in Unfinished tab)
5. Update BuyRPScreen TrendingUp button onClick to call navigate("buy-rp-record")
6. Update SellRPScreen: remove showRecords state + modal, change Record button onClick to navigate("sell-rp-record")
7. Update App render: add {screen === "buy-rp-record" && <BuyRPRecordScreen>} and {screen === "sell-rp-record" && <SellRPRecordScreen>} with correct props
