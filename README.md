# 🎬 CineSphere

> A sleek movie discovery and tracking web app built with React + Vite, powered by the IMDB unofficial API.


Discover Page:

![CineSphere Discover ](https://github.com/nirmaltej2003/Cinesphere/blob/main/Screenshot%202026-05-09%20081100.png)

Login Page:

![CineSphere Login](https://github.com/nirmaltej2003/Cinesphere/blob/main/Screenshot%202026-05-09%20081036.png)

Watchlist:

![CineSphere Watchlist](https://github.com/nirmaltej2003/Cinesphere/blob/main/Screenshot%202026-05-09%20081529.png)

Favourites:

![CineSphere Favourites](https://github.com/nirmaltej2003/Cinesphere/blob/main/Screenshot%202026-05-09%20081928.png)

---

## ✨ Features

- **Discover Movies** — Browse popular titles or search by keyword with debounced live search
- **Hero Banner** — Highlighted featured movie with poster, rating, genre tags, and IMDB link
- **Genre Filtering** — Filter results by Action, Comedy, Drama, Horror, Sci-Fi, Romance, Thriller, Animation
- **Sort Controls** — Sort by rating, release year, or title (A→Z)
- **Movie Detail Pages** — Full detail view with cast, director, runtime, plot, and ratings
- **Watchlist** — Save movies to watch later (persisted via localStorage)
- **Favorites** — Mark movies as favorites (persisted via localStorage)
- **Authentication** — Mock login/logout flow with protected routes
- **Toast Notifications** — Contextual feedback for user actions
- **Responsive Design** — Mobile-friendly with a hamburger nav drawer
- **Skeleton Loaders** — Smooth loading states with animated skeleton cards

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Plain CSS with CSS custom properties |
| API | IMDB Unofficial API (`imdb.iamidiotareyoutoo.com`) |
| State | React Context API + localStorage |
| Font | Outfit, DM Sans (Google Fonts) |

---

## 📁 Project Structure

```
cinesphere/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                # App entry point
    ├── App.jsx                 # Routes and provider tree
    ├── index.css               # Global styles + CSS variables
    │
    ├── api/
    │   └── imdb.js             # IMDB API wrapper (search, detail, trending, popular)
    │
    ├── components/
    │   ├── Header.jsx / .css   # Navigation bar with mobile drawer
    │   ├── MovieCard.jsx / .css# Reusable movie card component
    │   ├── RootLayout.jsx      # Shell layout wrapping all pages
    │   ├── ProtectedRoute.jsx  # Auth guard for private routes
    │   └── BackToTop.jsx       # Scroll-to-top button
    │
    ├── contexts/
    │   ├── AuthContext.jsx     # Login/logout state + mock users
    │   ├── WatchlistContext.jsx # Watchlist CRUD + localStorage sync
    │   ├── FavoritesContext.jsx # Favorites CRUD + localStorage sync
    │   └── ToastContext.jsx    # Toast notification system
    │
    ├── hooks/
    │   └── useDebounce.js      # Debounce hook for search input
    │
    └── pages/
        ├── LoginPage.jsx / .css      # Sign-in page with animated movie cards
        ├── DiscoverPage.jsx / .css   # Main browse/search page with hero banner
        ├── MovieDetailPage.jsx / .css# Individual movie detail view
        ├── WatchlistPage.jsx / .css  # User's saved watchlist
        └── FavoritesPage.jsx         # User's favorited movies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v18+**
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cinesphere.git
cd cinesphere

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# No API key required — the IMDB unofficial API is open
# Add any future keys here
```

### Running Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🔐 Demo Credentials

The app uses a mock authentication system. Use either of these accounts to sign in:

| Email | Password |
|---|---|
| `cinema@demo.com` | `movie123` |
| `cinephile@email.com` | `password` |

> **Note:** Authentication is purely client-side. No real backend or database is involved.

---

## 🌐 API Reference

CineSphere uses the [IMDB Unofficial API](https://imdb.iamidiotareyoutoo.com):

| Method | Endpoint | Description |
|---|---|---|
| `imdb.search(query)` | `GET /search?q=<query>` | Search movies by title keyword |
| `imdb.detail(id)` | `GET /title/<imdb_id>` | Fetch full details for a title |
| `imdb.popular()` | `GET /search?q=the` | Load a broad set of popular titles |
| `imdb.trending()` | Multiple searches | Combines action/drama/thriller results |

All responses are normalized into a consistent internal movie shape by `normalizeSearchItem()` and `normalizeDetail()` helpers in `src/api/imdb.js`.

---

## 💾 Local Storage Keys

| Key | Contents |
|---|---|
| `cs_token` | Logged-in user data (email, name) |
| `cs_watchlist` | Array of saved watchlist movie objects |
| `cs_favorites` | Array of favorited movie objects |

---

## 📱 Routes

| Path | Page | Auth Required |
|---|---|---|
| `/login` | Login Page | No |
| `/discover` | Discover / Search | No |
| `/movies/:id` | Movie Detail | No |
| `/watchlist` | Watchlist | ✅ Yes |
| `/favorites` | Favorites | ✅ Yes |

---

## 🎨 Design Tokens

Global CSS variables are defined in `src/index.css`:

```css
--amber:      #f5a623   /* Primary accent */
--bg-deep:    #0a0f1e   /* Darkest background */
--bg-dark:    #0d1426
--text-1:     #f0f4ff   /* Primary text */
--text-3:     #6b7a99   /* Muted text */
--radius-xl:  20px
--shadow-glow: 0 0 20px rgba(245,166,35,0.3)
```

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Serve the production build locally |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

