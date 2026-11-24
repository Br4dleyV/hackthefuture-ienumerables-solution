using { oakhaven.curse as db } from '../db/schema';

/**
 * Food data of Oakhaven: the village pantry.
 * Served at /odata/v4/food-stock — try http://localhost:4004/odata/v4/food-stock/StockItems
 */
// `impl` points CAP at the TypeScript handler file (written without the `.ts` extension).
service FoodStockService @(path: 'food-stock', impl: 'srv/food-stock-service') {

  @readonly
  entity StockItems as projection on db.StockItems {
    *,
    virtual null as stockStatus    : String,
    virtual null as daysUntilEmpty : Decimal(15,2),
    virtual null as orderBy        : Date,
    virtual null as orderQuantity  : Decimal(15,2),
    virtual null as orderLate      : Boolean,
    virtual null as supplierName   : String,
    virtual null as leadDays       : Integer
  } actions {
    /** Tobin records a delivery that arrived: adds a StockReceivals row and raises currentQuantity. */
    action receiveDelivery(quantity : Decimal(9, 2), supplier : String, receivedAt : DateTime);
  };

  @readonly
  entity StockReceivals as projection on db.StockReceivals;

  @readonly
  entity Notifications  as projection on db.Notifications;
}
