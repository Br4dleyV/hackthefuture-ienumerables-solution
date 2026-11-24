# Tobin Reyes — The Week Ahead

Source: Tobin’s HTF villager chat, as shared by the team. This note separates confirmed needs from design decisions. The original challenge materials are unchanged.

## Confirmed needs

- **Stock outlook per product:** Show how many days the current quantity will last at the consumption rate. Saturdays are market days and use twice as much flour as normal; account for that in the flour forecast. No Saturday adjustment was specified for other products.
- **Current stock status:** Below half the minimum is **panic**; otherwise, below the minimum is **worried**. The comparisons are strict: exactly half is worried, and exactly the minimum is not below minimum.
- **Order timing:** Recommend when to order so stock does not drop below the minimum before delivery. Lead time depends on the product, not the day the order is placed. If a new order can no longer arrive in time, make that clear immediately and recommend ordering today rather than presenting it as an ordinary upcoming deadline.
- **Order quantity:** Recommend enough to bring stock at delivery to the product’s minimum **plus seven days of normal use**. Milk at 60 L/day has a target of minimum + 420 L; 420 L is not necessarily the order quantity. Subtract the stock forecast to remain just before the delivery to calculate the recommendation. Tobin makes the final decision; do not automatically place orders.
- **Record received deliveries:** Tobin wants to enter the product, quantity, supplier and receipt date/time himself so actual stock reflects what arrived.
- **Messages:** Tobin checks his messages at **05:00** and wants a short morning summary without needing to open the pantry app. Tell him when things get worse or return to normal, without repeatedly sending the same warning. An unavoidable breach should be communicated straight away; the morning summary is not a reason to delay it.

## Supplier lead times

| Products | Supplier | Lead time |
| --- | --- | ---: |
| Milk | Local Dairy Farm | 1 day |
| Flour and grain | North Mill | 3 days |
| Eggs and butter | South Meadow Farms | 2 days |
| Everything else | Travelling merchant | 7 days |

## Design decisions and open details

- **Orders in transit:** Tobin wants to avoid duplicate orders but delegated how to handle them. The chat did not identify a source for pending orders. If the app tracks them, distinguish expected arrivals from received deliveries: use expected arrivals in the forecast, not in current stock, and still show a breach that occurs before an expected arrival.
- **Deadline precision:** Day versus exact hour is delegated. Test the recommendation against when Tobin can act at 05:00 so an otherwise valid deadline is not conveyed too late. Time zone and within-day consumption/delivery timing were not specified.
- **Rounding:** Delegated. No supplier pack sizes are known; do not assume fixed bag sizes. Rounding should not leave the recommended stock below the target.
- **Notification mechanics:** Message channel, delivery mechanism and repeat-suppression policy were not specified. A transition-based policy is a design option, not a confirmed rule.
- **Flour target versus forecast:** The forecast explicitly doubles Saturday flour usage. The refill target was described as a week of “normal use”; the chat did not explicitly say whether that target should also include the Saturday uplift.
