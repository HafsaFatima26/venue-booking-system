#  VenueSpot — Venue Booking System (Frontend)

A fully interactive React frontend for a Venue Booking System with two roles: **Customer** and **Owner**.

---

##  Getting Started

### 1. Prerequisites
- Node.js v16+ and npm installed
- [Download Node.js](https://nodejs.org)

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Run the App
```bash
npm start
```
App will open at **http://localhost:3000**

---

##  Folder Structure

```
venue-booking-app/
├── README.md
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html              # HTML shell (Bootstrap + Bootstrap Icons + Google Fonts)
    └── src/
        ├── index.js                # React entry point
        ├── App.js                  # Router + all routes
        │
        ├── context/
        │   └── AppContext.js       # Global state (venues, bookings, auth)
        │
        ├── data/
        │   └── dummyData.js        # Seed data (venues, bookings, users)
        │
        ├── styles/
        │   └── global.css          # Design tokens + all component styles
        │
        ├── components/
        │   ├── shared/
        │   │   ├── Navbar.js       # Top navigation bar
        │   │   ├── Toast.js        # Notification toast
        │   │   └── ProtectedRoute.js  # Route guard
        │   │
        │   ├── customer/
        │   │   ├── VenueCard.js    # Venue listing card
        │   │   └── FilterBar.js    # Filter/search bar
        │   │
        │   └── owner/
        │       ├── OwnerLayout.js  # Sidebar layout for owner pages
        │       └── VenueFormModal.js  # Add/Edit venue modal
        │
        └── pages/
            ├── LoginPage.js        # Role selector login
            │
            ├── customer/
            │   ├── CustomerDashboard.js  # Browse + filter venues
            │   ├── VenueDetails.js       # Venue detail + image gallery
            │   ├── BookingPage.js        # Booking form + payment
            │   └── MyBookings.js         # Customer's booking list
            │
            └── owner/
                ├── OwnerDashboard.js     # Venue CRUD management
                ├── OwnerBookings.js      # Accept/Reject bookings
                └── OwnerDetails.js       # Editable owner profile
```

---

##  Routing

| Route                  | Role     | Description                        |
|------------------------|----------|------------------------------------|
| `/login`               | Public   | Role selector (Customer / Owner)   |
| `/customer-dashboard`  | Customer | Browse & filter all venues         |
| `/venue/:id`           | Customer | Venue details + image gallery      |
| `/booking`             | Customer | Booking form + simulated payment   |
| `/my-bookings`         | Customer | View & cancel personal bookings    |
| `/owner-dashboard`     | Owner    | Add / Edit / Delete venues         |
| `/owner-bookings`      | Owner    | Accept / Reject booking requests   |
| `/owner-details`       | Owner    | Edit owner profile                 |

---

##  Tech Stack

| Technology       | Usage                              |
|------------------|------------------------------------|
| React 18         | UI framework                       |
| React Router v6  | Client-side routing                |
| Context API      | Global state management            |
| Bootstrap 5      | Grid, forms, utilities             |
| Bootstrap Icons  | Icon set                           |
| CSS Variables    | Design tokens & theming            |

---

##  Interactive Features

### Customer
- **Filter Bar** — Live-filters venue list by location, type, max price, date, and name search
- **Venue Cards** — Click to navigate to details page
- **Image Gallery** — Thumbnail switcher on venue detail
- **Booking Form** — Full validation + simulated payment; saves booking to state
- **My Bookings** — Lists session bookings; Cancel button removes instantly

### Owner
- **Add Venue** — Modal form; new venue appears in list immediately
- **Edit Venue** — Pre-filled modal; saves updates instantly
- **Delete Venue** — Confirm dialog; removes from state
- **Booking Requests** — Filter by status; Accept → confirmed, Reject → rejected, with live badge update

---

##  Notes

- No backend — all data lives in React state
- Data resets on page refresh (by design for a demo)

