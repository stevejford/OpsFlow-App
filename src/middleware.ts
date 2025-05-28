import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
  ignoredRoutes: [
    '/api/webhook',
    '/api/folders',
    '/api/documents',
    '/api/test-db',
    '/api/setup-tables',
    '/api/init-db'
  ]
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
