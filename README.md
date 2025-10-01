# Tommyhil Portfolio

**Live site:** [tommyhildoan.com](https://tommyhildoan.com)  

## Features

- **Personal landing page** with name, tagline, and branding.  
- **Current Focus** component that fetches live GitHub repository data and previews files directly in the UI.  
- **Spotify widget** with tabbed views for recently played and top tracks.  
- **Responsive layout** built with Tailwind CSS, optimized for desktop and mobile.  
- **Custom domain + SSL** deployed via Vercel (`tommyhildoan.com`).  

## Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript  
- **Styling:** Tailwind CSS  
- **Deployment:** Vercel  
- **Integrations:** GitHub fetch API, Spotify API  

## Notes

The most challenging aspects were:  
- Designing a **reusable GitHub preview component** that could dynamically load different repos/files.  
- Keeping the **Spotify widget** lightweight while still showing live data.  
- Managing **domain DNS + SSL** settings on Vercel.  

## Roadmap

Planned improvements:  
- Expand the **project showcase** section with case studies and links.  
- Improve caching/rendering for GitHub and Spotify API calls.
- Improve Ask me anything to handle spam
