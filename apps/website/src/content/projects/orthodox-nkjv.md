---
name: Orthodox NKJV
description: A Node.js module containing the complete text of the New King James Version (NKJV) Bible with Orthodox canon books, organized in JSON, XML, and Markdown files.
github: https://github.com/orthfx/orthodox-nkjv
live: https://www.npmjs.com/package/orthodox-nkjv
features:
  - Complete NKJV text in multiple formats
  - Orthodox canon books (Tobit, Judith, Wisdom, etc.)
  - Conversion scripts between formats
  - Easy integration for developers
---

# Orthodox NKJV

A Node.js module that contains the complete text of the New King James Version (NKJV) Bible, organized in separate JSON, XML, and Markdown files for each book.

## Overview

**orthodox-nkjv** is designed to make it easy for developers to integrate Bible text into their applications. The module includes the complete NKJV text with Orthodox canon books being added progressively.

## Installation

```bash
npm install orthodox-nkjv
```

## Orthodox Canon Books

The books from the Orthodox canon are being added in future updates to provide the complete collection of Eastern Orthodox Christian books of the bible:

- [x] Tobit
- [ ] Judith
- [ ] Wisdom of Solomon
- [ ] Sirach (Ecclesiasticus)
- [ ] Baruch
- [ ] 1 Maccabees
- [ ] 2 Maccabees
- [ ] 1 Esdras
- [ ] Prayer of Manasseh
- [ ] Psalm 151

## Features

### Multiple Formats
All books are available in three formats:
- **JSON**: Structured data perfect for web applications
- **XML**: Compatible with various Bible study tools
- **Markdown**: Human-readable format for documentation

### Conversion Scripts
The project includes helpful scripts for converting between formats:
- Markdown to JSON
- JSON to XML
- JSON to Markdown

### Easy Integration
Simple API for accessing Bible text in your Node.js applications.

## Usage

```javascript
import { readBibleBook } from 'orthodox-nkjv';

async function main() {
  const genesisData = await readBibleBook('Genesis');
  console.log(genesisData);
}
```

## Project Structure

```
orthodox-nkjv/
├── books/
│   ├── json/
│   ├── markdown/
│   └── xml/
├── examples/
├── scripts/
└── README.md
```

## Copyright Notice

The text of the New King James Version® (NKJV®) is copyrighted and owned by Thomas Nelson, Inc. Used by permission in accordance with their quotation policy.

## Links

- [GitHub Repository](https://github.com/orthfx/orthodox-nkjv)
- [npm Package](https://www.npmjs.com/package/orthodox-nkjv)
