# Portfolio

This project is a simple Next.js portfolio site.

## Prerequisites

- **Node.js** version 16 or later
- **npm** (comes with Node.js)

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Lint the project with:

```bash
npm run lint
```

Create an optimized production build and start it locally:

```bash
npm run build
npm start
```

## Deploying to Vercel

1. [Sign up](https://vercel.com/signup) for a Vercel account and install the Vercel CLI if desired.
2. Push your project to a Git repository (GitHub, GitLab, or Bitbucket).
3. From the Vercel dashboard, import your repository and follow the prompts.
4. Set up any environment variables under the **Settings → Environment Variables** section.
5. Vercel automatically builds and deploys your project on every push to your configured branches.

## Project Structure

```
/ (root)
  pages/         # Application routes and API endpoints
  public/        # Static assets such as images
  styles/        # CSS modules and global styles
  next.config.js # Next.js configuration
  tsconfig.json  # TypeScript configuration
```

## Environment Variables

Environment variables can be placed in a `.env.local` file for local development. For example, to configure email credentials used by a contact form:

```
CONTACT_EMAIL_USER=your-email@example.com
CONTACT_EMAIL_PASS=your-password
```

Make sure to define the same variables on Vercel when deploying so that your serverless functions have access to them.


