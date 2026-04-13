# Product Requirements Document

## Product
Shop Client Dashboard and Checkout

## Product framing
This product is an ecommerce-grade customer account and checkout system for Honey. The client application is implemented in TypeScript, while commerce validation, pricing integrity, and payment orchestration are designed around a Rust commerce core exposed through the existing backend API layer.

The goal is to make the customer journey behave like a modern retail experience rather than a simple order form. The dashboard must support repeat purchases, self-service account management, order visibility, saved checkout preferences, and a high-trust payment flow that reduces friction without sacrificing backend correctness.

## Vision
Create a customer dashboard that feels comparable to established ecommerce products:

- Fast catalog-to-cart-to-checkout progression
- Clear order tracking and post-purchase management
- Durable saved addresses and payment methods
- Strong pricing integrity enforced on the backend
- Checkout UX optimized for mobile-first East African commerce patterns, especially M-Pesa and saved-card reuse

## Primary users

### 1. Returning retail customer
Needs to reorder quickly, manage addresses, track shipments, and use a saved payment method.

### 2. First-time buyer
Needs a guided checkout with clear trust signals, transparent pricing, and low-friction payment setup.

### 3. High-intent mobile shopper
Needs a checkout flow that works well on smaller screens, supports M-Pesa cleanly, and minimizes typing.

## Product goals

- Increase checkout completion rate
- Increase repeat purchase rate
- Reduce support tickets for order status, address errors, and payment confusion
- Support self-service CRUD for all customer-owned commerce data
- Enforce server-side price, coupon, and fulfillment validation

## Non-goals

- Marketplace multi-vendor operations
- Advanced subscription billing in phase 1
- Deep warehouse management tooling
- Admin operations beyond what is needed for customer-facing order visibility

## Core experience pillars

### 1. Trustworthy checkout
The client can guide the user, but the backend must own totals, coupon eligibility, and payment intent creation.

### 2. Self-service dashboard
Customers should not need support to update an address, replace a card, or understand order status.

### 3. Repeat-purchase velocity
Reorder, favorites, saved preferences, and account defaults should compress the time to next order.

### 4. Mobile commerce realism
Delivery, pickup, phone-based payments, and concise confirmation states must reflect real ecommerce behavior.

## End-to-end user journey

### Browse to cart

1. Customer browses active products with variants, inventory visibility, and category context.
2. Customer adds one or more variant-backed items to cart.
3. Cart displays editable quantity, subtotal, delivery threshold hints, and a direct path to checkout.

### Checkout

1. Review step  
Customer reviews cart contents, order value, delivery threshold, and available promotions.

2. Delivery details step  
Customer chooses delivery or pickup, selects a saved address or enters a new address, and confirms contact information.

3. Payment step  
Customer selects M-Pesa or card. Saved cards are selectable for signed-in users. New cards can be vaulted for future checkout reuse.

4. Confirmation step  
Customer reviews backend-valid totals, coupon effect, shipping cost, and payment method before placing the order.

5. Success state  
Customer sees order number, fulfillment expectation, item summary, and next actions such as track order, continue shopping, or open dashboard.

### Post-purchase dashboard

1. Customer sees recent orders, spend summary, active addresses, and saved payment methods.
2. Customer can open an order detail, inspect tracking, cancel when eligible, or reorder.
3. Customer can manage addresses, payment methods, profile details, favorites, and support links.

## Information architecture

### Dashboard navigation

- Overview
- Orders
- Addresses
- Payment Methods
- Favorites or Wishlist
- Suggested Products
- Profile
- Checkout preferences
- Help and support

### Overview module

- Lifetime orders count
- Total spend
- Active default address
- Active default payment method
- Recent orders list
- Recommended products

### Orders module

- Orders list with status, date, value, payment status, and fulfillment method
- Order detail with item lines, totals, shipping details, tracking timeline, and payment summary
- Reorder action
- Cancel action for eligible pending orders

### Addresses module

- Create address
- Read address list
- Update address
- Delete address
- Set default address

### Payment methods module

- Create saved payment method
- Read payment method list
- Update label or default state
- Delete payment method
- Display vault status and last-four details only

### Favorites module

- View saved products
- Remove from wishlist
- Add favorite item to cart

### Profile module

- Display name
- Email
- Phone
- Marketing preferences
- Default delivery preference

## Functional requirements

### Product catalog and cart

- Products must have variants, pricing, availability, images, and category metadata.
- Cart items must always reference a product and a purchasable variant.
- Cart totals on the client are advisory only.
- Backend must recompute prices using authoritative product-variant pricing.

### Checkout

- Checkout must support delivery and pickup.
- Checkout must support M-Pesa and card payment options.
- Signed-in users must be able to use saved addresses and saved cards.
- Coupon codes must be validated server-side against minimum order rules and discount logic.
- Shipping must be calculated server-side using fulfillment rules.
- Backend must reject client totals that do not match server-calculated totals within a controlled tolerance.
- Every successful order creation must generate an order number and an initial tracking state.
- Checkout must support idempotency keys to avoid accidental duplicate orders.

### Customer dashboard CRUD

- Addresses: full CRUD plus default selection
- Payment methods: full CRUD plus default selection
- Wishlist: add, remove, list
- Orders: list, detail, cancel when eligible
- Profile: read and update supported fields

### Order tracking

- Order tracking must expose current status, estimated delivery, and timeline events.
- Initial event must be created at order creation time.
- Status vocabulary should include at least: pending, paid, processing, shipped, completed, cancelled.

### Recommendations

- Dashboard should show recommendation rails based on wishlist, prior orders, or active catalog heuristics.
- Recommendations should degrade gracefully to featured products if personalization data is sparse.

## Checkout UX requirements

### Required interaction standards

- Progress indicator with clear current step
- Large tap targets for mobile
- Inline validation for required contact and address fields
- Persistent order summary during the flow
- Visible shipping, discount, and total breakdown
- Save-and-reuse flows for addresses and cards
- Clear payment readiness state for saved cards

### M-Pesa flow

- Customer enters or confirms phone number
- Backend initiates STK push after order creation
- Confirmation state explains next action if payment is pending
- Failed payment initiation must return a useful recovery message

### Card flow

- Customer may select a vaulted card or verify a new card for reuse
- Backend creates a payment intent from authoritative order total
- Frontend confirms payment intent and updates order payment state
- Card identifiers stored in dashboard must be vault references only, never raw PAN data

## Backend architecture requirements

### TypeScript client responsibilities

- Collect user input
- Render catalog, cart, dashboard, and checkout states
- Persist local cart state
- Call authenticated shop APIs
- Display optimistic UI carefully without overriding backend totals

### Rust commerce core responsibilities

- Price calculation and line validation
- Coupon rule evaluation
- Shipping rule evaluation
- Idempotent order guards
- Payment orchestration contracts
- Fraud or anomaly hooks for future extension

### API layer responsibilities

- Authenticate the customer
- Mediate requests between TypeScript client and Rust core
- Persist orders, order items, tracking events, addresses, payment methods, and wishlist records
- Return normalized responses for dashboard and checkout views

## API surface

### Required endpoints

- `GET /shop/products`
- `GET /shop/products/{id}`
- `POST /shop/cart/validate` or equivalent pricing validation endpoint
- `POST /shop/checkout/init`
- `POST /shop/checkout/validate-coupon`
- `GET /shop/dashboard`
- `GET /shop/orders`
- `GET /shop/orders/{order_id}`
- `POST /shop/orders/{order_id}/cancel`
- `GET /shop/orders/{order_id}/tracking`
- `GET /shop/addresses`
- `POST /shop/addresses`
- `PUT /shop/addresses/{address_id}`
- `DELETE /shop/addresses/{address_id}`
- `GET /shop/payment-methods`
- `POST /shop/payment-methods`
- `PUT /shop/payment-methods/{payment_method_id}`
- `DELETE /shop/payment-methods/{payment_method_id}`
- `GET /shop/wishlist`
- `POST /shop/wishlist`
- `DELETE /shop/wishlist/{product_id}`

## Data model requirements

### Order

- `id`
- `order_number`
- `user_id`
- `status`
- `payment_status`
- `payment_method`
- `delivery_method`
- `shipping_address`
- `total_kes`
- `coupon_code`
- `notes`
- `idempotency_key`
- `created_at`

### Order item

- `order_id`
- `product_id`
- `variant_id`
- `quantity`
- `unit_price`
- `total_price`
- `price_at_purchase`

### Address

- `id`
- `user_id`
- `name`
- `email`
- `phone`
- `street`
- `apartment`
- `building`
- `floor`
- `city`
- `county`
- `postal_code`
- `is_default`

### Payment method

- `id`
- `user_id`
- `type`
- `provider`
- `brand`
- `last4`
- `expiry_month`
- `expiry_year`
- `card_holder_name`
- `stripe_payment_method_id`
- `status`
- `is_default`

### Tracking

- `order_id`
- `current_status`
- `estimated_delivery`
- `events[]`

## Business rules

- Only active variants with valid prices can be purchased.
- Delivery shipping fee applies below the configured threshold.
- Pickup removes delivery shipping fee.
- Coupons must be validated against minimum order and active rule state.
- Users may cancel only orders that have not moved beyond the eligible fulfillment stage.
- Setting a default address or payment method must unset previous defaults for the same user.

## Security and compliance

- Never trust client totals or discount amounts.
- Never expose raw payment instrument data.
- Require authenticated access for dashboard CRUD and order history.
- Use service-role writes only where backend mediation is required.
- Preserve auditability for order status changes and payment events.

## Analytics and events

- Checkout started
- Delivery method selected
- Payment method selected
- Coupon attempted
- Coupon applied
- Order placed
- Payment initiated
- Payment succeeded
- Payment failed
- Reorder clicked
- Order cancelled

## Success metrics

- Checkout completion rate
- Average time from checkout start to order placement
- Repeat purchase rate within 30 and 90 days
- Dashboard engagement rate
- Address reuse rate
- Saved payment method reuse rate
- Reduction in support contacts per 100 orders

## Acceptance criteria

- A signed-in user can create, edit, delete, and set defaults for addresses.
- A signed-in user can create, view, update, delete, and set defaults for payment methods.
- A signed-in user can see recent orders and open order details.
- A signed-in user can cancel an eligible order.
- Backend rejects manipulated totals and invalid coupon usage.
- Every successful checkout produces an order record, line items, and an initial tracking event.
- Checkout supports both delivery and pickup.
- Checkout works cleanly on desktop and mobile.
- Payment initiation feedback is visible and actionable.

## Rollout phases

### Phase 1

- Modernized checkout
- Dashboard overview
- Orders list and detail
- Address CRUD
- Payment method CRUD
- Wishlist
- Coupon validation
- Initial tracking

### Phase 2

- Full payment confirmation loop for saved cards
- Richer recommendations
- Delivery ETA logic by region
- Customer support ticket hooks
- Email and SMS order notifications

### Phase 3

- Loyalty credits
- Returns workflow
- Subscriptions or recurring delivery
- Advanced experimentation on checkout optimization

## Open implementation gaps to close next

- Complete the frontend confirmation path for Stripe payment intents returned by checkout initialization.
- Persist coupon code and discount metadata in the authoritative order record if reporting requires it.
- Add automated integration coverage for checkout totals, card flow, and order cancellation eligibility.
