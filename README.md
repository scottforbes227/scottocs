# scottocs

Infinite Canvas UI - A state-of-the-art personal website featuring a navigable 2D canvas built with Three.js and GSAP.

## Features

- **Password-protected access** with futuristic neon design
- **Infinite 2D canvas** with smooth pan/drag navigation
- **5 Content nodes**: Home, Work, About, Writing, Contact
- **Animated camera movements** using GSAP
- **Glowing neon aesthetic** with cyan color scheme
- **HTML content nodes** (fully selectable text)
- **Connecting lines** between nodes with animated effects

## Live Demo

Visit the live site at your Namecheap domain after deployment.

## Technologies

- **Three.js** - 3D graphics and scene management
- **GSAP** - Smooth camera animations
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Futuristic styling and effects

## Getting Started

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. Default password: `helloworld`

Or use a local server:
```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Deployment

See [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md) for detailed deployment steps.

**Quick deploy to Namecheap:**
1. Upload all files to `/public_html/` via FTP
2. Visit your domain
3. Enter password to access

## Project Structure

```
├── index.html              # Main HTML file
├── canvas.js               # Infinite canvas implementation
├── config.js               # Secure configuration
├── security.js             # Security measures
├── data.js                 # Encrypted user data
└── DEPLOYMENT_INSTRUCTIONS.md
```

## Navigation

- **Pan/Drag**: Click and drag to move around the canvas
- **Mouse Wheel**: Zoom in/out
- **Menu**: Use the navigation menu (top-right) to jump to sections

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

Requires WebGL support and modern JavaScript (ES6+).

## License

Personal project - All rights reserved.
