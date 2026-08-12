# ER Diagram

## Food Ordering & Delivery Platform

```mermaid
erDiagram

    CUSTOMER ||--o{ ORDERS : places
    RESTAURANT ||--o{ FOOD : provides
    RESTAURANT ||--o{ ORDERS : receives
    ORDERS ||--|{ ORDER_ITEM : contains
    FOOD ||--o{ ORDER_ITEM : includes
    CUSTOMER ||--o{ CART : owns
    FOOD ||--o{ CART : added_to
    ORDERS ||--o| DELIVERY : has
    DELIVERY_PARTNER ||--o{ DELIVERY : handles

    CUSTOMER {
        int customer_id PK
        string name
        string email
        string password
        string phone
        string address
    }

    RESTAURANT {
        int restaurant_id PK
        string name
        string email
        string password
        string phone
        string address
    }

    FOOD {
        int food_id PK
        int restaurant_id FK
        string name
        string description
        float price
        string category
        string availability
    }

    CART {
        int cart_id PK
        int customer_id FK
        int food_id FK
        int quantity
    }

    ORDERS {
        int order_id PK
        int customer_id FK
        int restaurant_id FK
        string order_date
        float total_amount
        string order_status
    }

    ORDER_ITEM {
        int order_item_id PK
        int order_id FK
        int food_id FK
        int quantity
        float price
    }

    DELIVERY_PARTNER {
        int delivery_partner_id PK
        string name
        string email
        string password
        string phone
        string vehicle_number
    }

    DELIVERY {
        int delivery_id PK
        int order_id FK
        int delivery_partner_id FK
        string delivery_status
        string delivery_date
    }