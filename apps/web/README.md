This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

From the repository root, run the Turbopack development server with pnpm:

```bash
pnpm dev
```

To run the local development server over HTTPS:

```bash
pnpm dev:https
```

The HTTPS script uses local certificate files in `certificates/`, which are intentionally ignored by Git.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Create [apps/web/.env.local.example](/Users/valeriiinshyn/Dev/Projects/Personal/mini-jarvis/apps/web/.env.local.example) as [apps/web/.env.local](/Users/valeriiinshyn/Dev/Projects/Personal/mini-jarvis/apps/web/.env.local) and provide:

- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: your Supabase publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: your Supabase service role key. Keep it server-only.
- `GOOGLE_CLIENT_ID`: your Google OAuth Web application client ID.
- `GOOGLE_CLIENT_SECRET`: the matching Google OAuth client secret.

In Supabase Auth, enable the Google provider and configure it with the same Google client ID and secret. Add your local app URL to the Supabase redirect allow list, and in Google Cloud Console add the callback URL shown by Supabase for the Google provider. The app requests Google profile/email access plus Drive file access so Mini Jarvis can create and update its own files in your Drive.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
