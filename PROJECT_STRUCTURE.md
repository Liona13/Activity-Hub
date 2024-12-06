# ActivityHub Project Structure

## Directory Structure

```
activityhub/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── public/                     # Static files
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── activities/
│   │   │   └── users/
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── profile/
│   │   └── activities/       # Activity pages
│   ├── components/           # React components
│   │   ├── common/          # Shared components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── Modal/
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   └── features/        # Feature-specific components
│   │       ├── activities/
│   │       ├── auth/
│   │       └── search/
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   │   ├── api/
│   │   ├── auth/
│   │   └── db/
│   ├── models/              # Database models
│   ├── styles/              # Global styles
│   └── types/               # TypeScript types
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── config/                  # Configuration files
├── scripts/                 # Build/deployment scripts
└── docs/                    # Documentation
    ├── api/
    └── guides/

```

## Navigation Structure

### Public Routes
```
/                           # Home page
├── /search                 # Search activities
├── /activities             # Browse all activities
│   └── /[activityId]      # Individual activity page
├── /login                 # Login page
└── /register              # Registration page
```

### Protected Routes (Requires Authentication)
```
/dashboard                  # User dashboard
├── /profile               # User profile
│   └── /edit             # Edit profile
├── /activities            # User's activities
│   ├─ /create           # Create new activity
│   └── /[activityId]     # Manage specific activity
│       ├── /edit         # Edit activity
│       └── /participants # Manage participants
└── /settings             # User settings
    ├── /account          # Account settings
    ├── /notifications    # Notification preferences
    └── /privacy          # Privacy settings
```

## Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── SearchBar
│   │   └── UserMenu
│   └── Footer
├── HomePage
│   ├── HeroSection
│   │   └── ActivityCarousel
│   ├── FeaturedActivities
│   └── CategorySection
├── ActivityPages
│   ├── ActivityList
│   │   └── ActivityCard
│   ├── ActivityDetail
│   │   ├── ActivityHeader
│   │   ├── ActivityContent
│   │   └── ActivityComments
│   └── ActivityForm
└── AuthPages
    ├── LoginForm
    ├── RegisterForm
    └── ProfileForm
```

## Database Schema Structure

### User Collection
```
User {
  _id: ObjectId
  email: String
  name: String
  profileImage: String
  socialProfiles: {
    google?: String
    facebook?: String
  }
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Activity Collection
```
Activity {
  _id: ObjectId
  title: String
  description: String
  category: String
  location: {
    type: String
    coordinates: [Number]
  }
  creator: ObjectId (ref: User)
  images: [String]
  date: DateTime
  participants: [{
    user: ObjectId (ref: User)
    status: String
  }]
  tags: [String]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Comment Collection
```
Comment {
  _id: ObjectId
  activity: ObjectId (ref: Activity)
  user: ObjectId (ref: User)
  content: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Rating Collection
```
Rating {
  _id: ObjectId
  activity: ObjectId (ref: Activity)
  user: ObjectId (ref: User)
  score: Number
  review: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

## API Structure

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
```

### Activity Endpoints
```
GET    /api/activities
POST   /api/activities
GET    /api/activities/:id
PUT    /api/activities/:id
DELETE /api/activities/:id
POST   /api/activities/:id/images
POST   /api/activities/:id/participants
```

### User Endpoints
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id/activities
POST   /api/users/settings
```

### Social Endpoints
```
POST   /api/activities/:id/comments
POST   /api/activities/:id/ratings
POST   /api/activities/:id/share
``` 