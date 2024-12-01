# NASDAQ Earnings Tracker

A modern web application that helps users track and monitor upcoming NASDAQ earnings reports. Built with Next.js, TypeScript, and Prisma.

## Features

- 📊 Real-time earnings data display
- 📅 Interactive date navigation with business day filtering
- ⭐ Personal watchlist functionality
- 🔒 GitHub authentication
- 💬 Community discussion through comments
- 🌓 Pre-market and after-hours earnings indicators
- 📱 Responsive design
- 🔄 Sortable data columns

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Authentication**: NextAuth.js with GitHub provider
- **Database**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **Icons**: Lucide React

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/harryytsao/Earnings-Tracker.git
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables in `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Database
DATABASE_URL=your-database-url
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/types` - TypeScript type definitions
- `/lib` - Utility functions and shared libraries
- `/prisma` - Database schema and migrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
