# S&B Project Plan

## 1. Product

S&B is a fashion e-commerce platform for clothing, shoes, accessories, and coordinated outfits.

## 2. Customer Experience

Customers should be able to:

1. Discover products from the home page.
2. Browse categories.
3. Search and filter products.
4. Open detailed product pages.
5. Select size and color where applicable.
6. Add products to a cart.
7. Save products to a wishlist.
8. Create an account and manage their profile.
9. Place and track orders.
10. Leave ratings and reviews.
11. Submit suggestions.
12. Explore coordinated couple outfits.
13. Build a complete outfit.
14. Get help from the S&B assistant.

## 3. Store Management

The owner/admin should be able to:

- Add products.
- Edit product names.
- Change prices.
- Upload/change product images.
- Edit descriptions.
- Manage categories.
- Manage sizes and colors.
- Update stock.
- Publish/unpublish products.
- Manage orders.
- Review customer suggestions.
- Moderate reviews.
- Manage homepage content.

Customers must never have permission to change product information.

## 4. Important Technical Principle

Product information must eventually be stored in a database rather than hard-coded into the customer interface.

The frontend should request product data from the backend.

The admin panel should update the database.

## 5. Virtual Outfit Feature

The first implementation will use a controllable model/outfit interface.

Later versions can add more realistic 3D clothing or an AI virtual try-on service.

The project must not claim that a prototype provides physically accurate clothing simulation until that capability is actually implemented.

## 6. Privacy

Location will only be requested when it is needed for delivery/address functionality.

The application should clearly ask for permission before using a customer's device location.
