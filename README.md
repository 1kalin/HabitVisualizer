![image](https://github.com/user-attachments/assets/a6418d22-e26b-4c28-bb32-ca09d0720d83)


# Habit Tracker Application

A comprehensive habit tracking application with visualization features to help users monitor and maintain their daily routines.

## Features

- **Dashboard** - Overview of habit completion status with daily statistics
- **Calendar View** - Monthly visualization of habit completion patterns
- **Statistics** - Detailed charts showing completion rates and habit performance
- **Habit Management** - Create, update, and delete habits with custom frequency settings

## Tech Stack

- **Frontend:** React with TypeScript, TailwindCSS, shadcn/ui components
- **Backend:** Express.js with TypeScript
- **State Management:** React Query for server state
- **Data Visualization:** Recharts for statistics and reports

## Setup and Running

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the application: `npm run dev`
4. Open browser at http://localhost:5000

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components for each route
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions and configuration
- `/server` - Backend Express application
  - `/routes.ts` - API endpoints
  - `/storage.ts` - Data storage and persistence
- `/shared` - Shared types and schemas used by both client and server

## Future Enhancements

- User authentication
- Data persistence with PostgreSQL
- Mobile application support
- Export/import habit data
- Advanced reminders and notifications
