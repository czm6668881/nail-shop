# Hero Carousel Guide

## Overview

The homepage now includes a hero carousel with the following capabilities:
- Autoplay with a 5-second interval
- Manual navigation via left/right arrows
- Clickable indicators for direct slide access
- Autoplay pauses while the cursor hovers over the carousel
- Admin panel support for creating, editing, reordering, and deleting slides

## Implementation Details

### 1. Database
- Added the `hero_slides` table to store slide data
- Columns include: title, subtitle, image URL, button text, button link, sort order, active status, and timestamps

### 2. Admin experience
- Route: `/admin/hero-slides`
- Features:
  - Create new slides
  - Edit existing slides
  - Enable or disable slides
  - Delete slides
  - Upload new images

### 3. Frontend display
- Location: top of the homepage hero section
- Highlights:
  - Cross-fade transition between images
  - Responsive layout for mobile and desktop
  - Accessibility support through ARIA attributes
  - Falls back to the original static hero when no slides exist

## How to Use

### Add the first slide
1. Visit `http://localhost:3000/admin/hero-slides`.
2. Click **Add slide**.
3. Provide the following:
   - **Title** (required), e.g., "Gel Manicure"
  - **Subtitle** (optional), e.g., "Discover our premium press-on nails"
   - **Image** (required): upload or provide a URL, e.g., `/luxury-press-on-nails-hero-image-elegant-hands.jpg`
   - **Button text** (optional), e.g., "Shop now"
   - **Button link** (optional), e.g., `/products`
   - **Active**: keep enabled to display the slide
4. Click **Create** to save.

### Add more slides
Repeat the steps above to add additional slides. Two to five slides provide the best experience.

## File Reference

### Added files
- `lib/api/hero-slides.ts` - shared helpers for fetching hero slides
- `app/api/hero-slides/route.ts` - public API for active slides
- `app/api/admin/hero-slides/route.ts` - admin API for listing, creating, and sorting
- `app/api/admin/hero-slides/[id]/route.ts` - admin API for detail, update, and delete
- `app/admin/hero-slides/page.tsx` - admin management screen
- `components/hero-carousel.tsx` - frontend carousel component
- `HERO_CAROUSEL_SETUP.md` - this guide

### Updated files
- `lib/db/schema.ts` - hero slide table definition
- `types/database.ts` - generated database types
- `types/index.ts` - `HeroSlide` interface
- `app/page.tsx` - integrates the carousel
- `components/admin/admin-shell.tsx` - adds the "Hero Slides" navigation link

## Notes

1. **Database migration:** the `hero_slides` table is created automatically on first run.
2. **Images:** use assets from the `/public` directory or upload new images from the admin UI.
3. **Existing features:** the rest of the homepage remains unchanged.
4. **Localization:** the admin interface text is in English to match the updated project language.

## Testing

Visit `http://localhost:3000` to confirm the carousel renders. The fallback hero displays if no slides exist.

Create a slide in `http://localhost:3000/admin/hero-slides`, then refresh the homepage to view it.
