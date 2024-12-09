# ActivityHub

A modern web application for creating and joining activities, built with Next.js 14, TypeScript, and Prisma.

## Features

- 🔐 Authentication with NextAuth
- 📝 Create and manage activities
- 👥 Join activities and interact with participants
- 🗺️ Location-based activities with Google Maps integration
- 💬 Real-time comments
- 📸 Image upload support
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Auth:** NextAuth.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Components:** Radix UI
- **Maps:** Google Maps API
- **Image Upload:** React Dropzone
- **Rich Text:** TipTap
- **Form Handling:** React Hook Form
- **Validation:** Zod

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Liona13/Activity-Hub.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env`

5. Setup the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
