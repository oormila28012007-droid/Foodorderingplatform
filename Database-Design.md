# Database Design

## 1. CUSTOMER

- customer_id (Primary Key)
- name
- email
- password
- phone
- address

## 2. RESTAURANT

- restaurant_id (Primary Key)
- name
- email
- password
- phone
- address

## 3. FOOD

- food_id (Primary Key)
- restaurant_id (Foreign Key)
- name
- description
- price
- category
- availability

## 4. CART

- cart_id (Primary Key)
- customer_id (Foreign Key)
- food_id (Foreign Key)
- quantity

## 5. ORDERS

- order_id (Primary Key)
- customer_id (Foreign Key)
- restaurant_id (Foreign Key)
- order_date
- total_amount
- order_status

## 6. ORDER_ITEM

- order_item_id (Primary Key)
- order_id (Foreign Key)
- food_id (Foreign Key)
- quantity
- price

## 7. DELIVERY_PARTNER

- delivery_partner_id (Primary Key)
- name
- email
- password
- phone
- vehicle_number

## 8. DELIVERY

- delivery_id (Primary Key)
- order_id (Foreign Key)
- delivery_partner_id (Foreign Key)
- delivery_status
- delivery_date

## 9. ADMIN

- admin_id (Primary Key)
- name
- email
- password
