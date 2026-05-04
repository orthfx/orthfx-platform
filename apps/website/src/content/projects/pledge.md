---
name: Pledge
description: A Next.js subscription payments starter kit for building high-performance SaaS applications.
github: https://github.com/orthfx/pledge
live: https://subscription-payments.vercel.app/
features:
  - Secure user management with Supabase
  - Stripe Checkout and customer portal integration
  - Automatic syncing of pricing plans via webhooks
  - PostgreSQL database with Prisma
---

# Pledge

The all-in-one starter kit for high-performance SaaS applications with subscription payments.

## Overview

Pledge is a complete Next.js subscription payments starter template that handles all the complex parts of building a SaaS application - authentication, payments, and database management.

## Features

### User Management
- Secure user authentication with Supabase
- Email/password and OAuth support
- User profile management
- Session handling

### Payments
- Integration with Stripe Checkout
- Customer portal for subscription management
- Automatic syncing of pricing plans via Stripe webhooks
- Support for multiple pricing tiers and billing intervals

### Database
- Powerful data access with Supabase PostgreSQL
- Automatic schema syncing
- Real-time subscriptions
- Row-level security

### Architecture

The template follows best practices for SaaS applications:
- Webhook integration for reliable payment processing
- Automatic database updates on subscription changes
- Customer portal for self-service management
- Production-ready configuration

## Tech Stack

- **Next.js**: React framework for production
- **Supabase**: Backend-as-a-service for authentication and database
- **Stripe**: Payment processing and subscription management
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

## Getting Started

1. Clone the repository
2. Set up Supabase project
3. Configure Stripe account
4. Set environment variables
5. Deploy to Vercel

## Step-by-step Setup

Detailed setup instructions are provided in the repository, covering:
- Vercel deployment
- Supabase configuration
- Stripe webhook setup
- Creating products and pricing

## Going Live

The template includes a comprehensive guide for transitioning from test mode to production, including:
- Archiving test products
- Configuring production environment variables
- Setting up production webhooks
- Testing with live Stripe payments

## Links

- [GitHub Repository](https://github.com/orthfx/pledge)
- [Live Demo](https://subscription-payments.vercel.app/)
