 You now have enough to sketch Tobin’s ordering calculator. The next question is whether to count deliveries already on the way.

 │ “If flour is due to arrive in two days, should the app count that delivery before recommending another order? What if you’ll drop
 │ below your minimum tomorrow, before it arrives?”

 ### Confirmed rules

 ┌─────────────────┬─────────────────────┬───────────┐
 │ Products        │ Supplier            │ Lead time │
 ├─────────────────┼─────────────────────┼───────────┤
 │ Milk            │ Local Dairy Farm    │ 1 day     │
 ├─────────────────┼─────────────────────┼───────────┤
 │ Flour and grain │ North Mill          │ 3 days    │
 ├─────────────────┼─────────────────────┼───────────┤
 │ Eggs and butter │ South Meadow Farms  │ 2 days    │
 ├─────────────────┼─────────────────────┼───────────┤
 │ Everything else │ Travelling merchant │ 7 days    │
 └─────────────────┴─────────────────────┴───────────┘

 When a delivery arrives, Tobin wants the product’s minimum plus seven days of normal use on hand. For milk, that’s the minimum + 420
 L. That’s the target stock after delivery, not the amount to order. He still makes the final decision.

 ### How that translates into the app

 - Days until empty: current stock ÷ daily consumption.
 - Current status: below half the minimum → panic; otherwise below the minimum → worried. Check panic first so the two statuses don’t
   overlap.
 - When to order: work backward from when stock will reach the minimum, using the product’s lead time. For milk at 60 L/day, ordering
   at minimum + 60 L would have
    the delivery arrive just as stock hits the minimum, assuming steady usage and no other deliveries.
 - How much to order: subtract the stock expected just before delivery from the target stock after delivery. In that milk example, the
   order would be 420 L because the pantry would still have its minimum when the delivery arrived.

 After the incoming-delivery question, ask what Tobin wants to see when even ordering today won’t prevent stock from dropping below the
 minimum. That’s a different situation from an ordinary “order today” recommendation.   