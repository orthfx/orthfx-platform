---
name: jpb
description: A digital Orthodox Christian prayer book app based on the Jordanville Prayer Book with interactive glossary and beautiful typography.
github: https://github.com/orthfx/jpb
features:
  - Dark/Light mode support
  - Interactive glossary with hover tooltips
  - Rich typography with drop caps
  - Structured content with easy navigation
  - Mobile-friendly responsive design
  - Prayers organized by category
---

# jpb

A digital Orthodox Christian prayer book app based on the Jordanville Prayer Book published by Holy Trinity Monastery. Features modern enhancements while preserving the traditional prayer content.

## Overview

This app provides an accessible, beautifully formatted digital version of traditional Orthodox prayers with modern features that enhance the prayer experience without compromising the sacred content.

## Key Features

### Prayer Content

- **Morning Prayers** - Daily morning devotions
- **Evening Prayers** - Prayers before sleep
- **Liturgical Services** - Vespers, Matins, Divine Liturgy
- **Canons** - Devotional canons to Christ, Theotokos, Guardian Angel
- **Occasional Prayers** - Prayers throughout the day
- **Special Feasts** - Pascha, Passion Week, and more

### User Experience

- **Interactive Glossary**: Hover over Orthodox terms to see definitions inline
- **Rich Typography**: Proper formatting with drop caps, headings, and spacing
- **Dark/Light Mode**: System-aware theme switching for comfortable reading
- **Mobile-First**: Optimized for prayer on any device
- **Structured Navigation**: Easy browsing by prayer category

### Content Processing

The app features a sophisticated content pipeline:

1. PDF extraction to source text
2. Section parsing and cleaning
3. OCR error correction
4. Structured JSON format with annotations
5. Glossary term highlighting

## Tech Stack

- Vite for fast development
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Radix UI for accessible tooltips and dropdowns

## Current Status

- ✅ Vite + React + TypeScript setup
- ✅ Dark/light mode theming
- ✅ Content extraction and parsing (12 sections)
- ✅ Interactive glossary with tooltips
- ✅ Beautiful typography with drop caps
- ✅ Morning Prayers fully annotated
- 🚧 Adding annotations to remaining sections

## Links

- [GitHub Repository](https://github.com/orthfx/jpb)
