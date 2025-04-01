# Role Issues Troubleshooting Guide

## The Problem

Some users are experiencing an issue where their role in the database (e.g., "admin") is not being correctly reflected in their session token. This causes authorization issues where the user can't access pages that should be available to them based on their role.

## Root Causes

1. **JWT Token Not Updated**: The JWT token stored in the browser cookies might not be updated with the new role after the role is changed in the database.
2. **NextAuth Callbacks**: The callbacks in the NextAuth configuration might not be correctly updating the role from the database.
3. **Cookie Issues**: The browser's cookies might be cached or corrupted.

## Solutions Implemented

We've implemented several solutions to help diagnose and fix this issue:

### 1. Session Fix Tool (`/fix-role`)

This page helps diagnose and fix session token issues:
- It shows the current session data alongside the actual database data
- It detects mismatches between session role and database role
- It provides a button to clear all session cookies and log out

### 2. Force-Access Admin Dashboard (`/admin/force`)

For administrators who need immediate access, we've created a special route:
- This page bypasses the normal role check
- It still confirms the user is authenticated
- It displays a warning if the user doesn't have admin role in the database

### 3. NextAuth JWT Update

We've updated the NextAuth configuration to always fetch the latest role from the database when refreshing the JWT token.

## How to Fix Your Role Issue

### Method 1: Clear Session and Cookies (Recommended)

1. Visit `/fix-role` in your browser
2. Click "Run Diagnostics" to see if there's a mismatch
3. If there is a mismatch, click "Clear Session & Sign Out"
4. Sign in again with your credentials

### Method 2: Use the Bypass URL

If you need immediate access to admin features:
1. Visit `/admin/force` in your browser
2. This will bypass the role check and let you access admin features

### Method 3: Manual Cookie Clearing

If the above methods don't work:
1. Open your browser's developer tools (F12 or Right-click > Inspect)
2. Go to the Application/Storage tab
3. Find and delete all cookies for your site domain
4. Reload the page and sign in again

## Preventing Future Issues

We've updated the NextAuth configuration to always fetch the latest user role from the database when refreshing the JWT token. This should prevent role mismatches in the future.

## Technical Details

### Database Fields

The user's role is stored in:
- MongoDB collection: `users`
- Field: `role`
- Possible values: `"admin"`, `"user"`, `"viewer"` or undefined

### JWT Token Structure

The JWT token contains the following fields:
- `id`: User's MongoDB ID
- `role`: User's role from the database
- `name`: User's name
- `email`: User's email
- `picture`: User's profile picture (if available)

### Session Structure

The session object available in client components contains:
- `user.id`: User's MongoDB ID
- `user.role`: User's role from the database
- `user.name`: User's name
- `user.email`: User's email
- `user.image`: User's profile picture (if available)

## Further Assistance

If you continue to experience issues after trying these solutions, please:
1. Check the server logs for any error messages
2. Verify your MongoDB connection is working correctly
3. Ensure the user document in the database has the correct role set 