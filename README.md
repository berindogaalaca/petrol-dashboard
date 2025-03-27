# Petrol Dashboard Application

## Overview

This is a modern web application built with Next.js 15 and TypeScript that provides real-time petroleum data visualization and analysis. The application features a responsive dashboard interface with interactive charts and data tables, powered by real-time API integrations.

## Features

- Real-time petroleum data monitoring
- Interactive data visualization with Recharts
- Responsive dashboard layout
- Accessible UI components
- Data export functionality
- Real-time data updates
- Custom hooks for data fetching and state management

## Prerequisites

- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd task-project
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL="your-database-url"
```

4. Set up the database:

Write your database url to env

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

- `/src/app` - Next.js application routes and API endpoints
- `/src/components` - Reusable UI components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and configurations
- `/src/providers` - Context providers
- `/src/types` - TypeScript type definitions
- `/src/utils` - Helper functions
- `/src/views` - Page-specific components

## API Integration

The application integrates with various petroleum data APIs to provide real-time information about:

- Current oil prices
- Historical price trends
- Supply and demand metrics
- Market analysis
- Regional price comparisons

## Build for Production

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm run start
# or
yarn start
```
