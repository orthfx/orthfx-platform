---
name: Sites
description: A multi-tenant platform starter kit for building scalable applications with custom domain support.
github: https://github.com/orthfx/sites
live: https://app.vercel.pub/
features:
  - Multi-tenancy with unlimited custom domains
  - AI-powered Markdown editor
  - Image uploads with Vercel Blob
  - Dynamic OG cards for each post
  - Built with Next.js App Router and Vercel
---

# Sites

The all-in-one starter kit for building multi-tenant applications with custom domain support.

## Overview

Sites is a full-stack Next.js application template that enables you to build platforms where users can create their own sites with custom domains - similar to platforms like Substack, Medium, or Hashnode.

## Features

### 1. Multi-Tenancy
- Programmatically assign unlimited custom domains to users
- Automatic SSL certificate provisioning
- Subdomain support (e.g., `username.yourplatform.com`)
- Custom domain support (e.g., `blog.example.com`)
- No need for custom nameservers

### 2. Performance
- Fast & beautiful blog posts cached via Vercel's Edge Network
- On-demand cache invalidation when users make changes
- Incremental Static Regeneration with Next.js
- Uses Next.js `revalidateTag` API

### 3. AI-Powered Editor
- Notion-style writing experience powered by [Novel](https://novel.sh/)
- Markdown support with live preview
- Rich text editing capabilities
- Clean, distraction-free interface

### 4. Image Management
- Drag & drop / copy & paste image uploads
- Backed by Vercel Blob storage
- Automatic optimization
- CDN delivery

### 5. Customization
- Custom fonts per site
- Custom 404 pages
- Custom favicons
- Automatic sitemaps
- Dynamic OG cards for social sharing

### 6. Dark Mode
Built-in dark mode support for better user experience.

## Use Cases

### Content Creation Platforms
Blogs and publications with standardized layouts:
- Hashnode
- Mirror.xyz
- Read.cv

### Website Builders
No-code site builders with customizable pages:
- Super.so (Notion to website)
- Typedream
- Makeswift

### B2B2C Platforms
Multi-tenant authentication and access controls:
- Instatus (status pages)
- Cal.com (scheduling)
- Dub (link shortening)

## Tech Stack

- **Next.js** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS
- **Prisma** - ORM for database access
- **Novel** - AI-powered WYSIWYG editor
- **Vercel Postgres** - Database
- **Vercel Blob** - Image storage
- **NextAuth.js** - Authentication
- **Tremor** - Charts and analytics
- **Vercel** - Deployment and domains

## Architecture

The platform handles multi-tenancy by:
1. Detecting the hostname of incoming requests
2. Fetching the appropriate site data from the database
3. Rendering the correct content for that site
4. Caching responses at the edge for performance

## Getting Started

Deploy your own version with one click:
- Automatic Vercel Postgres setup
- Pre-configured domain management
- Example sites and content

## Links

- [GitHub Repository](https://github.com/orthfx/sites)
- [Live Demo](https://app.vercel.pub/)
- [Documentation](https://vercel.com/guides/nextjs-multi-tenant-application)
