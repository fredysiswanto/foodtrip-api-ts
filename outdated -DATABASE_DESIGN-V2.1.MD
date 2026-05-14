# FoodTrip API — Database Design (v2.1)

**Refined from v2 with fixes for:**

- Schema inconsistencies (avatar, logo, banner standardization)
- Explicit CHECK constraints
- Composite UNIQUE constraints
- Stock management strategy
- Audit logging integration
- Soft delete defaults

---

# 1. Database Overview

## Main Domains

```txt
Authentication
├── users
├── roles
├── me
└── refresh_tokens


Restaurant
├── restaurants
├── restaurant_images (via uploads)
└── categories

Menu
├── dishes
└── dish_images (via uploads)

Ordering
├── carts
├── cart_items
├── orders
└── order_items

Delivery
├── deliveries
└── delivery_histories (future)

System
├── uploads
├── audit_logs
└── settings (future)
```

---

# 2. roles

Master role system.

## Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

| Column      | Type        | Notes              |
| ----------- | ----------- | ------------------ |
| id          | UUID        | PK                 |
| name        | VARCHAR(50) | UNIQUE             |
| description | TEXT        | nullable           |
| created_at  | TIMESTAMP   |                    |
| updated_at  | TIMESTAMP   |                    |
| deleted_at  | TIMESTAMP   | NULL (soft delete) |

## Example Data

```txt
SUPER_ADMIN
RESTO_ADMIN
RESTO_STAFF
DRIVER
CUSTOMER
```

---

# 3. users

All users in system.

## Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL,
  restaurant_id UUID,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password VARCHAR(255) NOT NULL,
  avatar_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (avatar_id) REFERENCES uploads(id),

  CONSTRAINT role_restaurant_check CHECK (
    CASE
      WHEN role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN') THEN restaurant_id IS NULL
      WHEN role_id = (SELECT id FROM roles WHERE name = 'CUSTOMER') THEN restaurant_id IS NULL
      WHEN role_id = (SELECT id FROM roles WHERE name = 'DRIVER') THEN restaurant_id IS NULL
      ELSE restaurant_id IS NOT NULL
    END
  )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

| Column        | Type         | Notes                       |
| ------------- | ------------ | --------------------------- |
| id            | UUID         | PK                          |
| role_id       | UUID         | FK roles.id                 |
| restaurant_id | UUID         | FK restaurants.id, nullable |
| full_name     | VARCHAR(150) |                             |
| email         | VARCHAR(150) | UNIQUE                      |
| phone         | VARCHAR(30)  | nullable                    |
| password      | VARCHAR(255) | bcrypt hashed               |
| avatar_id     | UUID         | FK uploads.id, nullable ✨  |
| is_active     | BOOLEAN      | default true                |
| last_login_at | TIMESTAMP    | nullable                    |
| created_at    | TIMESTAMP    |                             |
| updated_at    | TIMESTAMP    |                             |
| deleted_at    | TIMESTAMP    | NULL (soft delete)          |

### Role-Restaurant Relationship

| Role        | restaurant_id | Notes                  |
| ----------- | ------------- | ---------------------- |
| SUPER_ADMIN | NULL          | Manages entire system  |
| CUSTOMER    | NULL          | No restaurant access   |
| DRIVER      | NULL          | Independent contractor |
| RESTO_ADMIN | REQUIRED      | Owns restaurant        |
| RESTO_STAFF | REQUIRED      | Works at restaurant    |

---

# 4. refresh_tokens

JWT refresh token storage.

## Table

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

# 5. restaurants

Restaurant data with approval workflow.

## Table

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  phone VARCHAR(30),
  email VARCHAR(150),
  address TEXT NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  logo_id UUID,
  banner_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  open_time TIME,
  close_time TIME,
  rejected_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (logo_id) REFERENCES uploads(id),
  FOREIGN KEY (banner_id) REFERENCES uploads(id),

  CHECK (status IN ('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED'))
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX idx_restaurants_deleted_at ON restaurants(deleted_at);
```

| Column          | Type          | Notes                                          |
| --------------- | ------------- | ---------------------------------------------- |
| id              | UUID          | PK                                             |
| owner_id        | UUID          | FK users.id                                    |
| name            | VARCHAR(150)  |                                                |
| slug            | VARCHAR(150)  | UNIQUE                                         |
| description     | TEXT          |                                                |
| phone           | VARCHAR(30)   |                                                |
| email           | VARCHAR(150)  | nullable                                       |
| address         | TEXT          |                                                |
| city            | VARCHAR(100)  |                                                |
| province        | VARCHAR(100)  |                                                |
| postal_code     | VARCHAR(20)   |                                                |
| latitude        | DECIMAL(10,7) | nullable, for maps                             |
| longitude       | DECIMAL(10,7) | nullable, for maps                             |
| logo_id         | UUID          | FK uploads.id, nullable ✨                     |
| banner_id       | UUID          | FK uploads.id, nullable ✨                     |
| status          | VARCHAR(20)   | PENDING\|APPROVED\|ACTIVE\|SUSPENDED\|REJECTED |
| is_open         | BOOLEAN       |                                                |
| open_time       | TIME          |                                                |
| close_time      | TIME          |                                                |
| rejected_reason | TEXT          | nullable, required if status=REJECTED          |
| created_at      | TIMESTAMP     |                                                |
| updated_at      | TIMESTAMP     |                                                |
| deleted_at      | TIMESTAMP     | NULL (soft delete)                             |

### Restaurant Status Flow

```
PENDING
  ↓ (Admin approval)
APPROVED
  ↓ (Owner can activate)
ACTIVE
  ↓ (Admin action or owner request)
SUSPENDED
  ↓ (Reactivation)
ACTIVE

PENDING → REJECTED (Admin rejection)
  └─ rejected_reason populated
```

---

# 6. restaurant_images

Gallery images for restaurants.

## Table

```sql
CREATE TABLE restaurant_images (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  upload_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (upload_id) REFERENCES uploads(id),

  UNIQUE(restaurant_id, upload_id)
);

CREATE INDEX idx_restaurant_images_restaurant_id ON restaurant_images(restaurant_id);
```

---

# 7. categories

Dish categories.

## Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_categories_slug ON categories(slug);
```

---

# 8. dishes

Menu items with stock management and optimistic locking.

## Table

```sql
CREATE TABLE dishes (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  category_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  image_id UUID,
  stock INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (image_id) REFERENCES uploads(id),

  UNIQUE(restaurant_id, slug),
  CHECK (stock >= 0),
  CHECK (price > 0)
);

CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE INDEX idx_dishes_is_available ON dishes(is_available);
CREATE INDEX idx_dishes_restaurant_available ON dishes(restaurant_id, is_available);
CREATE INDEX idx_dishes_deleted_at ON dishes(deleted_at);
```

| Column        | Type          | Notes                                        |
| ------------- | ------------- | -------------------------------------------- |
| id            | UUID          | PK                                           |
| restaurant_id | UUID          | FK restaurants.id                            |
| category_id   | UUID          | FK categories.id                             |
| name          | VARCHAR(150)  |                                              |
| slug          | VARCHAR(150)  | UNIQUE per restaurant                        |
| description   | TEXT          |                                              |
| price         | DECIMAL(12,2) | CHECK > 0                                    |
| image_id      | UUID          | FK uploads.id, nullable ✨                   |
| stock         | INTEGER       | CHECK >= 0                                   |
| is_available  | BOOLEAN       |                                              |
| is_featured   | BOOLEAN       |                                              |
| version       | INTEGER       | For optimistic locking (⚠️ see Strategy doc) |
| created_at    | TIMESTAMP     |                                              |
| updated_at    | TIMESTAMP     |                                              |
| deleted_at    | TIMESTAMP     | NULL (soft delete)                           |

---

# 9. dish_images

Additional dish images (gallery).

## Table

```sql
CREATE TABLE dish_images (
  id UUID PRIMARY KEY,
  dish_id UUID NOT NULL,
  upload_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (upload_id) REFERENCES uploads(id),

  UNIQUE(dish_id, upload_id)
);
```

---

# 10. carts

Shopping cart per user per restaurant.

## Table

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),

  UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_carts_user_id ON carts(user_id);
```

**Business Rule:** 1 user = 1 cart per restaurant. Creating a new cart removes old one.

---

# 11. cart_items

Items in cart.

## Table

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL,
  dish_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id),

  CHECK (quantity > 0),
  CHECK (price > 0)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
```

**Note:** `price` is snapshot of dish price at add time.

---

# 12. orders

Order records with comprehensive tracking.

## Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_no VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
  payment_method VARCHAR(20),
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  ordered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),

  CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
  CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
  CHECK (payment_method IN ('CASH', 'TRANSFER', 'EWALLET', 'QRIS')),
  CHECK (total >= subtotal)
);

CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_deleted_at ON orders(deleted_at);
```

| Column           | Type          | Notes                                |
| ---------------- | ------------- | ------------------------------------ |
| id               | UUID          | PK                                   |
| order_no         | VARCHAR(50)   | UNIQUE, format: `ORD-YYYYMMDD-XXXXX` |
| user_id          | UUID          | FK users.id                          |
| restaurant_id    | UUID          | FK restaurants.id                    |
| subtotal         | DECIMAL(12,2) | Sum of items                         |
| delivery_fee     | DECIMAL(12,2) |                                      |
| tax              | DECIMAL(12,2) |                                      |
| total            | DECIMAL(12,2) | subtotal + delivery_fee + tax        |
| status           | VARCHAR(20)   | See flow below                       |
| payment_status   | VARCHAR(20)   | UNPAID\|PAID\|FAILED\|REFUNDED       |
| payment_method   | VARCHAR(20)   | CASH\|TRANSFER\|EWALLET\|QRIS        |
| customer_name    | VARCHAR(150)  |                                      |
| customer_phone   | VARCHAR(30)   |                                      |
| delivery_address | TEXT          |                                      |
| notes            | TEXT          | nullable                             |
| ordered_at       | TIMESTAMP     |                                      |
| confirmed_at     | TIMESTAMP     | nullable, set when CONFIRMED         |
| delivered_at     | TIMESTAMP     | nullable, set when DELIVERED         |
| completed_at     | TIMESTAMP     | nullable, set when COMPLETED         |
| created_at       | TIMESTAMP     |                                      |
| updated_at       | TIMESTAMP     |                                      |
| deleted_at       | TIMESTAMP     | NULL (soft delete)                   |

### Order Status Flow

```
                ┌─ CANCELLED
                │
PENDING → CONFIRMED → PREPARING → DELIVERING → COMPLETED
```

### Payment Status Logic

| payment_method | payment_status                                  |
| -------------- | ----------------------------------------------- |
| CASH           | UNPAID initially, PAID on delivery confirmation |
| TRANSFER       | UNPAID, needs payment verification              |
| EWALLET, QRIS  | UNPAID initially, PAID on webhook callback      |

---

# 13. order_items

Snapshot of items at order time.

## Table

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  dish_id UUID NOT NULL,
  dish_name VARCHAR(150) NOT NULL,
  dish_price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id),

  CHECK (quantity > 0),
  CHECK (subtotal = dish_price * quantity)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

**Purpose:** Snapshot protection. If dish is deleted/price changed, order items remain accurate.

---

# 14. deliveries

Delivery assignment and tracking.

## Table

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE,
  driver_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES users(id),

  CHECK (status IN ('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'))
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
```

### Delivery Status Flow

```
PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
              ↓
           FAILED (optional)
```

---

# 15. uploads

Centralized file upload management.

## Table

```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  folder VARCHAR(100) NOT NULL,
  path VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (uploaded_by) REFERENCES users(id),

  CHECK (type IN ('avatar', 'restaurant_logo', 'restaurant_banner', 'dish_image')),
  CHECK (folder IN ('users/avatars', 'restaurants/logos', 'restaurants/banners', 'dishes/images'))
);

CREATE INDEX idx_uploads_filename ON uploads(filename);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX idx_uploads_type ON uploads(type);
```

| Column        | Type         | Notes                              |
| ------------- | ------------ | ---------------------------------- |
| id            | UUID         | PK                                 |
| original_name | VARCHAR(255) | e.g., "my-restaurant.jpg"          |
| filename      | VARCHAR(255) | UNIQUE, hashed: "abc123def456.jpg" |
| mime_type     | VARCHAR(100) | "image/jpeg", "image/png", etc.    |
| type          | VARCHAR(50)  | Category for organization          |
| folder        | VARCHAR(100) | Storage path structure             |
| path          | VARCHAR(255) | Full URL or relative path          |
| size          | BIGINT       | File size in bytes                 |
| uploaded_by   | UUID         | FK users.id                        |
| created_at    | TIMESTAMP    |                                    |

---

# 16. audit_logs

System audit trail for compliance and debugging.

## Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Audit Actions & Modules

| Module      | Actions                                       |
| ----------- | --------------------------------------------- |
| restaurants | CREATE, UPDATE_STATUS, SUSPEND, DELETE        |
| dishes      | CREATE, UPDATE_PRICE, UPDATE_STOCK, DELETE    |
| orders      | CREATE, UPDATE_STATUS, CANCEL, DELETE         |
| users       | CREATE, UPDATE (exclude password), DELETE     |
| auth        | LOGIN, LOGOUT, PASSWORD_CHANGE, TOKEN_REFRESH |

**Rules:**

- Never log sensitive data (passwords, tokens)
- Mask email/phone in `old_data`/`new_data`
- Automatic logging via middleware

---

# 17. Relationships & Cascades

```txt
roles (1) ──→ (many) users
users  (1) ──→ (many) refresh_tokens [CASCADE DELETE]
users  (1) ──→ (many) restaurants (owner_id) [RESTRICT]
users  (1) ──→ (many) carts [CASCADE DELETE]
users  (1) ──→ (many) orders [RESTRICT]
users  (1) ──→ (1) avatar upload

restaurants (1) ──→ (many) dishes [CASCADE DELETE]
restaurants (1) ──→ (many) restaurant_images [CASCADE DELETE]
restaurants (1) ──→ (many) orders [RESTRICT]
restaurants (1) ──→ (1) logo upload
restaurants (1) ──→ (1) banner upload

categories (1) ──→ (many) dishes [RESTRICT]
dishes  (1) ──→ (many) cart_items [RESTRICT]
dishes  (1) ──→ (many) order_items [RESTRICT]
dishes  (1) ──→ (many) dish_images [CASCADE DELETE]
dishes  (1) ──→ (1) image upload

carts   (1) ──→ (many) cart_items [CASCADE DELETE]
orders  (1) ──→ (many) order_items [CASCADE DELETE]
orders  (1) ──→ (1) delivery [CASCADE DELETE]

deliveries (many) ──→ (1) driver (users) [RESTRICT]
uploads (many) ──→ (1) uploader (users) [RESTRICT]
```

---

# 18. Indexes Summary

**Primary Key Indexes (automatic)**

**Foreign Key Indexes:**

- users(role_id)
- users(restaurant_id)
- users(avatar_id)
- restaurants(owner_id)
- restaurants(logo_id, banner_id)
- dishes(restaurant_id, category_id, image_id)
- carts(user_id, restaurant_id)
- cart_items(cart_id, dish_id)
- orders(user_id, restaurant_id)
- order_items(order_id, dish_id)
- deliveries(order_id, driver_id)

**Search/Filter Indexes:**

- users(email, deleted_at)
- restaurants(slug, status, city, deleted_at)
- dishes(is_available, deleted_at) + composite (restaurant_id, is_available)
- orders(order_no, status, payment_status, deleted_at) + composites (user_id, status), (restaurant_id, status)
- deliveries(status)
- categories(slug)
- refresh_tokens(token)
- uploads(filename, type)
- audit_logs(user_id, entity_id, entity_type, created_at)

---

# 19. Naming Conventions

### Tables

```
snake_case, plural
restaurants, users, order_items, restaurant_images
```

### Columns

```
snake_case, descriptive
created_at, restaurant_id, payment_status
```

### Foreign Keys

```
{table_singular}_id
user_id, restaurant_id, order_id
```

### Constraints

```
constraint_name = {table}_{type}_{columns}
restaurants_status_check
users_role_restaurant_check
cart_items_quantity_check
```

---

# 20. Sequelize Implementation Hints

### Soft Deletes

```typescript
paranoid: true; // Adds deletedAt column, filters automatically
```

### Status Enums

```typescript
validate: {
  isIn: [
    [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "DELIVERING",
      "COMPLETED",
      "CANCELLED",
    ],
  ];
}
```

### Optimistic Locking

See `STOCK-MANAGEMENT-STRATEGY.MD`

### Default Scopes

```typescript
defaultScope: {
  where: {
    deletedAt: null;
  }
}
```

---

# 21. Transaction Isolation

For operations involving stock deduction:

```sql
-- MySQL/PostgreSQL
START TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

Ensures:

- No dirty reads
- No non-repeatable reads
- Phantom reads prevented for pessimistic locking

---

# 22. Future Tables

```
payments
payment_transactions
notifications
promo_codes
reviews
addresses (user delivery addresses)
loyalty_points
webhooks
settings
delivery_histories
```

---

# 23. MVP Recommendation

✅ **Required for MVP:**

- users, roles
- restaurants
- categories, dishes
- carts, cart_items
- orders, order_items
- uploads
- refresh_tokens

⏳ **Post-MVP:**

- deliveries (Phase 7)
- audit_logs (Phase 7)
- payments (Phase 9)
- notifications, promo_codes (Phase 10+)

✨ **Key Fixes in v2.1:**

- avatar, logo, banner now UUID FK (not VARCHAR)
- Explicit CHECK constraints on all status fields
- Composite UNIQUE constraints on junction tables
- uploads table now has `type` and `folder` columns
- Restaurant rejection workflow with `rejected_reason`
- Detailed delivery status flow
- Comprehensive indexes
