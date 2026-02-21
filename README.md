# QR Canvas

A beautiful, fully client-side QR code generator with advanced design customization. No data ever leaves your browser.

**Completely vibe coded by Boshe during NSND 2026 at [Base42](https://42.mk).** Zero humans were harmed in the writing of this code. Several were mildly confused by it.

Vibe checks pass, good enough.

## Features

- **11 Content Types** - URL, Text, Email, Phone, SMS, vCard, MeCard, WiFi, Location, Event, Crypto
- **Design Customization** - Colors, gradients (linear & radial), custom eye colors
- **Shape Variety** - 10 body shapes, 5 eye frame shapes, 5 eye ball shapes
- **Logo Support** - Upload PNG/JPG/GIF/SVG with adjustable size and background removal
- **12 Templates** - Pre-built designs to get started quickly
- **Export Options** - Download as PNG, SVG, or PDF at up to 4000px resolution
- **Dark Mode** - Automatic detection with manual toggle
- **Error Correction** - 4 levels (L/M/Q/H), auto-increases when logo is added
- **Contrast Warning** - Alerts when colors may affect scannability
- **100% Client-Side** - Zero server calls, complete privacy

## Quick Start

Just open `index.html` in a browser. No build step, no dependencies to install.

```
# Or serve locally
python3 -m http.server 8080
```

## Tech Stack

- Vanilla HTML/CSS/JS (no frameworks, no bundlers, no node_modules black hole)
- [qrcode-generator](https://github.com/niclas3/qrcode-generator) - QR matrix generation
- [jsPDF](https://github.com/parallax/jsPDF) - PDF export
- Google Fonts (Inter)
- Mass amounts of caffeine and questionable prompting decisions

## The NSND 2026 Story

This project was born at Base42's Nothing is Going to Happen (Nista se nece dogoditi) hackathon. The rules said no hardware tools - they didn't say anything about letting an AI write your entire app while you supervise with a coffee in hand. Is it cheating? We prefer "creative interpretation of the rules." The QR codes work. The code... also works. We checked. Once.

## Contributing

PRs welcome, but honestly the AI might rewrite your contribution before you finish your commit message. If you find a bug, that's a feature we haven't documented yet.

## License

MIT License

Copyright (c) 2025 Base42 / 42.mk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
