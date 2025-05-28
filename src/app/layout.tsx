import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/sidebar.css';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import { DocumentSettingsProvider } from '@/contexts/DocumentSettingsContext';
import { Toaster } from 'sonner';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

// Metadata is defined here for Next.js to use at build time
export const metadata = {
  title: 'OpsFlow - Operations Management System',
  description: 'A comprehensive operations management system for handling employee records, license tracking, credentials, tasks, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
            rel="stylesheet"
          />
          {/* Remove the async attribute to ensure Font Awesome is fully loaded before rendering */}
          <script 
            src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"
            defer
          ></script>
        </head>
        <body className={inter.className + " bg-gray-100"}>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <DocumentSettingsProvider>
            <SidebarWrapper>{children}</SidebarWrapper>
          </DocumentSettingsProvider>
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
