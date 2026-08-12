# Problem Statement

## 1. Title
Food Ordering & Delivery Platform

## 2. Domain
Food Ordering and Delivery

## 3. Who is the User?

The main users of the application are:

1. Customer - Searches for restaurants, views food items, adds food to cart, places orders, and tracks orders.
2. Restaurant - Manages food items, receives customer orders, and updates order status.
3. Delivery Partner - Views assigned orders and updates delivery status.

## 4. What Problem Are We Solving?

Customers often face difficulties in finding restaurants, selecting food, placing orders, and tracking deliveries efficiently. Restaurants need an easy system to manage food items and customer orders. Delivery partners also need a system to view assigned deliveries and update their delivery status. Therefore, a single platform is needed to connect customers, restaurants, and delivery partners.

## 5. Proposed Solution

The Food Ordering & Delivery Platform will provide a single application for managing the complete food ordering process.

The application will allow:

- Customers to register and login.
- Customers to browse restaurants and food items.
- Customers to add food items to cart.
- Customers to place orders.
- Customers to view order status.
- Restaurants to add, update, and delete food items.
- Restaurants to view and manage customer orders.
- Delivery partners to view assigned orders.
- Delivery partners to update delivery status.

## 6. Core Entities / Database Tables

1. Customer
2. Restaurant
3. Food
4. Cart
5. Order
6. Order_Item
7. Delivery_Partner
8. Delivery
9. Admin

## 7. User Roles & Permissions

### Customer
- Register and login
- Browse restaurants
- View food items
- Add food to cart
- Place orders
- View order status

### Restaurant
- Login
- Manage food items
- View customer orders
- Update order status

### Delivery Partner
- Login
- View assigned deliveries
- Update delivery status

### Admin
- Manage customers
- Manage restaurants
- Manage delivery partners
- View orders

## 8. Success Criteria

The project will be considered successful when:

- A customer can register and login successfully.
- A customer can select food and place an order.
- A restaurant can receive and manage orders.
- A delivery partner can view assigned deliveries.
- Order and delivery status can be updated successfully.
- The system stores and retrieves data correctly from the database.

## 9. Out of Scope

The following features will not be implemented in the initial version:

- Real-time GPS tracking
- Live chat
- Voice ordering
- Advanced AI-based food recommendations
- Multi-country delivery
- Real payment gateway integration

## 10. Chosen Track

Java - Spring Boot