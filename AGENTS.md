<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Environment Variables

Required environment variables for Vercel Blob image storage:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token (obtain from Vercel dashboard)
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Better Auth secret key
- `BETTER_AUTH_URL`: Application URL for auth
- `NEXT_PUBLIC_APP_URL`: Public application URL (for payment callbacks and redirects)
- `APP_URL`: Application base URL (fallback for server-side)

Payment environment variables (PAPI):
- `PAPI_API_KEY`: Papi.mg API key
- `PAPI_BASE_URL`: Papi.mg base URL (default: https://app.papi.mg)
- `PAPI_WEBHOOK_URL`: Override webhook callback URL (optional, defaults to NEXT_PUBLIC_APP_URL)

## Vercel Blob Configuration

For image uploads to work correctly:

1. **Store Access Type**: Configure your Vercel Blob store as **public** in the Vercel dashboard
   - Go to Vercel Dashboard → Storage → Blob → Your Store
   - Change access type from "private" to "public"
   - This allows images to be displayed directly via their Blob URLs

2. **Private Store (Current Configuration)**: The current implementation supports private stores:
   - Images are uploaded with `access: 'private'`
   - A proxy route `/api/images/[filename]` serves the images
   - Custom image loader handles proxy URLs
   - Next.js remotePatterns configured for Blob domains
   - Existing `/uploads/` URLs still supported

3. **Migration Script**: To migrate existing Blob URLs to proxy format:
   ```bash
   npx tsx scripts/migrate-blob-urls.ts
   ```
   This converts `blob.vercel-storage.com` URLs to `/api/images/filename` format.

## Build Commands

- TypeScript validation: `npx tsc --noEmit`
- Run tests: `pnpm test`
- Build: `pnpm build`
