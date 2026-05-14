# FoodTrip API — Database Design

This design supports a restaurant and food ordering system with:

- multi-restaurant ownership (one user may own multiple restaurants)
- restaurant-specific staff and admin roles
- customers and drivers as global users
- a maintainable, scalable schema with clear domain boundaries
- audit logs, uploads, and order snapshotting for reliability

---

## Design goals

- Keep the schema simple and easy to maintain.
- Avoid role logic encoded in complex SQL constraints.
- Support one owner managing multiple restaurants.
- Support multiple staff members per restaurant.
- Keep customers and drivers as global users.
- Keep restaurant metadata and menu data separate.

---

## Core tables

### `roles`

Global system roles.

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

Example values:

- SUPER_ADMIN
- CUSTOMER
- DRIVER

---

### `users`

All users in the system.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  avatar_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (avatar_id) REFERENCES uploads(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

Notes:

- `role_id` is a global role.
- Role-specific restaurant assignment is handled in `restaurant_users`.
- This keeps `users` simple and avoids a single `restaurant_id` field.

---

### `restaurants`

Restaurants owned by one or more users.

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  phone VARCHAR(30),
  email VARCHAR(150),
  address TEXT NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  logo_id UUID NULL,
  banner_id UUID NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  open_time TIME NULL,
  close_time TIME NULL,
  rejected_reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (logo_id) REFERENCES uploads(id),
  FOREIGN KEY (banner_id) REFERENCES uploads(id),

  CHECK (status IN ('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED'))
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_deleted_at ON restaurants(deleted_at);
```

Notes:

- `restaurants` is independent from `users`.
- Owner relationships are stored in `restaurant_users`.
- This supports one owner with multiple restaurants.

---

### `restaurant_users`

Restaurant-specific user membership.

```sql
CREATE TABLE restaurant_users (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  restaurant_role VARCHAR(20) NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE (restaurant_id, user_id),
  CHECK (restaurant_role IN ('OWNER', 'ADMIN', 'STAFF'))
);

CREATE INDEX idx_restaurant_users_restaurant_id ON restaurant_users(restaurant_id);
CREATE INDEX idx_restaurant_users_user_id ON restaurant_users(user_id);
```

Benefits:

- One user may belong to multiple restaurants.
- Each restaurant can have different staff.
- Owners are simply a restaurant user with `restaurant_role = 'OWNER'`.
- Global roles remain in `users.role_id`.

---

### `categories`

Menu categories used by dishes.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_categories_slug ON categories(slug);
```

---

### `dishes`

Menu items per restaurant.

```sql
CREATE TABLE dishes (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  category_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL,
  image_id UUID NULL,
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

  UNIQUE (restaurant_id, slug),
  CHECK (stock >= 0),
  CHECK (price > 0)
);

CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE INDEX idx_dishes_is_available ON dishes(is_available);
CREATE INDEX idx_dishes_restaurant_available ON dishes(restaurant_id, is_available);
CREATE INDEX idx_dishes_deleted_at ON dishes(deleted_at);
```

Notes:

- Keep one `restaurant_id` per dish.
- `version` supports optimistic locking if needed.
- Keep business logic such as stock validation in app code.

---

### `dish_images`

Extra images for dishes.

```sql
CREATE TABLE dish_images (
  id UUID PRIMARY KEY,
  dish_id UUID NOT NULL,
  upload_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (upload_id) REFERENCES uploads(id),

  UNIQUE (dish_id, upload_id)
);
```

---

### `restaurant_images`

Gallery images for restaurants.

```sql
CREATE TABLE restaurant_images (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  upload_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (upload_id) REFERENCES uploads(id),

  UNIQUE (restaurant_id, upload_id)
);

CREATE INDEX idx_restaurant_images_restaurant_id ON restaurant_images(restaurant_id);
```

---

### `uploads`

Central file metadata.

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
  CHECK (type IN ('avatar', 'restaurant_logo', 'restaurant_banner', 'dish_image'))
);

CREATE INDEX idx_uploads_filename ON uploads(filename);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX idx_uploads_type ON uploads(type);
```

Note:

- Keep file storage metadata separate from business tables.
- Use app logic to map `type` and `folder` values.

---

### `carts`

User shopping carts per restaurant.

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  UNIQUE (user_id, restaurant_id)
);

CREATE INDEX idx_carts_user_id ON carts(user_id);
```

Business rule:

- One user may have one active cart per restaurant.
- For multi-restaurant support, separate carts by `restaurant_id`.

---

### `cart_items`

Items inside a cart.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL,
  dish_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id),

  CHECK (quantity > 0),
  CHECK (price > 0)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
```

Note: `price` is an item snapshot at add time.

---

### `orders`

Order headers and status tracking.

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
  payment_method VARCHAR(20) NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT NULL,
  ordered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
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

Notes:

- Keep order totals and snapshots in the order record.
- Use app logic to enforce payment flows.

---

### `order_items`

Snapshot of ordered dishes.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  dish_id UUID NOT NULL,
  dish_name VARCHAR(150) NOT NULL,
  dish_price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id),

  CHECK (quantity > 0),
  CHECK (subtotal = dish_price * quantity)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

### `deliveries`

Delivery assignment and status tracking.

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE,
  driver_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
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

---

### `refresh_tokens`

JWT refresh token storage.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

### `audit_logs`

Audit trail for important actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  ip_address VARCHAR(100) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

Rules:

- Do not store passwords or raw tokens.
- Mask sensitive fields in JSON payloads.

---

## Relationship summary

- `roles` → `users`
- `users` → `restaurant_users` → `restaurants`
- `restaurants` → `dishes`, `restaurant_images`
- `categories` → `dishes`
- `dishes` → `dish_images`, `cart_items`, `order_items`
- `carts` → `cart_items`
- `orders` → `order_items`, `deliveries`
- `users` → `refresh_tokens`, `audit_logs`
- `uploads` → `users`, `restaurants`, `dishes`

---

## Design notes

- Keep role validation in application logic rather than complex DB checks.
- Use a simple `restaurant_users` join table for multi-restaurant ownership and staff membership.
- Keep `users` global and restaurant membership separate.
- Prefer database enums or Prisma enums for `status` and role values.
- Add indexes selectively based on actual query patterns.
- Soft delete with `deleted_at` is fine, but ensure app filters it consistently.

---

## Why this is simpler

- avoids a single `restaurant_id` on `users`
- supports one owner managing many restaurants
- supports different staff per restaurant
- keeps customers and drivers outside restaurant membership
- separates global roles from restaurant roles
- keeps the schema easy to reason about and maintain
