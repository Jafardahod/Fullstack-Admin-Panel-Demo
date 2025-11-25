# Full Stack Assignment App

A 5-page full stack web application built with:

- **React + Material UI**
- **Node.js + Express**
- **MySQL**
- **JWT Authentication**
- Role-based access (admin vs normal user)

## Features

### Authentication

- Login page (Admin + Normal user)
- JWT-based authentication
- Credentials stored in MySQL
- Admin and normal users distinguished by `role` column

### Role-Based UI

- **Admin:**
  - Sidebar menu: `Home`, `User Master`, `Item Master`
  - Can manage (CRUD) normal users
  - Can manage (CRUD) items
  - Sees list of users and items on home page

- **Normal User:**
  - Sidebar menu: `Home`, `Profile`, `Orders`, `Support` (dummy pages)
  - Cannot access `User Master` or `Item Master`
  - Can view items on home page

### Pages

1. **Login Page**
2. **Home Page**
   - Section 1: All users (admin only)
   - Section 2: All items (admin + normal user)
3. **User Master (Admin only)**
   - CRUD operations on normal users
   - Admin users not listed for CRUD
   - Fields:
     - User_Id, UserName, FullName, Email, Mobile,
       Country, State, City, Address, Pincode, Password
4. **Item Master (Admin only)**
   - CRUD operations on items
   - Fields:
     - Item name, Item price, Item type
5. **Dummy Pages (Normal user only)**
   - Profile
   - Orders
   - Support

## Tech Stack

### Frontend

- React
- React Router
- Material UI
- Axios

### Backend

- Node.js
- Express
- MySQL (mysql2)
- JWT
- bcryptjs
- dotenv
- cors

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
