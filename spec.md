# WynPay

## Current State
Buy RP screen shows level cards (L1-L6) with buy amount buttons. Users tap an amount, confirm, and receive RP.

## Requested Changes (Diff)

### Add
- Teal header with L1-L7 pill tabs; active level is white pill
- Search icon in top-right
- Scrollable transaction list per level: ID, Receive button, Payment Amount, Award (~3% of payment)

### Modify
- BuyRPScreen: Replace level-card grid with transaction list UI
- Add L7 level
- Header: solid teal, white pills for tabs

### Remove
- Old buy button grid and confirm dialog

## Implementation Plan
1. Add L7 to LEVELS
2. Rewrite BuyRPScreen with teal header + level tab row + scrollable card list
3. Mock 8-10 transactions per level with random IDs and amounts
4. Receive button updates rpCoins, buyQuantity, buyAmount
