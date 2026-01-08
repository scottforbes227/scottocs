# Infinite Canvas UI - Visual Mockup

## Password Gate (Entry Point)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                         ╔═════════╗                        │
│                         ║  ENTER  ║ (glowing cyan)         │
│                         ╚═════════╝                        │
│                                                            │
│                    ┌─────────────────┐                     │
│                    │   Password      │ (cyan border)       │
│                    └─────────────────┘                     │
│                                                            │
│                    ┌─────────────────┐                     │
│                    │     ACCESS      │ (cyan gradient)     │
│                    └─────────────────┘                     │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
                     Black background (#000000)
```

## Infinite Canvas Layout (After Authentication)

```
                            NORTH
                        ┌───────────┐
                        │   WORK    │ (0, 100)
                        │ Projects  │
                        └─────┬─────┘
                              │
                              │ (glowing line)
                              │
WEST                          │                          EAST
┌───────────┐                 │                   ┌───────────┐
│  CONTACT  │─────────────────●─────────────────  │   ABOUT   │
│   Info    │ (-100, 0)     CENTER             │  │   Facts   │ (100, 0)
└───────────┘           SCOTT FORBES           │  └───────────┘
                    "Developer • Explorer"      │
                              │
                              │ (glowing line)
                              │
                        ┌─────┴─────┐
                        │  WRITING  │ (0, -100)
                        │   Blog    │
                        └───────────┘
                            SOUTH
```

### Legend:
- `●` = Center node with hero text
- `┌───┐` = Content node with HTML container
- `│` / `─` = Glowing cyan connecting lines
- Coordinates shown in parentheses (x, y)

## Navigation Menu (Top-Right Overlay)

```
┌─────────────┐
│    HOME     │ → Navigate to (0, 0)
├─────────────┤
│    WORK     │ → Navigate to (0, 100)
├─────────────┤
│    ABOUT    │ → Navigate to (100, 0)
├─────────────┤
│   WRITING   │ → Navigate to (0, -100)
├─────────────┤
│   CONTACT   │ → Navigate to (-100, 0)
└─────────────┘
```

## Node Content Examples

### Center Node (Hero)
```
╔═══════════════════════════════╗
║      Scott Forbes             ║
║  Developer • Explorer • Thinker ║
╚═══════════════════════════════╝
```

### About Node (East)
```
╔═══════════════════════════════╗
║           ABOUT               ║
║───────────────────────────────║
║  Countries Visited (XX/197)   ║
║  Albania, Argentina, ...      ║
║                               ║
║  Currently Reading            ║
║  [Book Title]                 ║
╚═══════════════════════════════╝
```

### Work Node (North) - Placeholder
```
╔═══════════════════════════════╗
║      WORK & PROJECTS          ║
║───────────────────────────────║
║  Coming soon...               ║
╚═══════════════════════════════╝
```

## Visual Effects

### Glowing Spheres at Each Node
- **Color**: Cyan (#00ffff)
- **Effect**: Pulsating glow animation (1.0x → 1.2x scale)
- **Duration**: 2 seconds loop

### Connecting Lines
- **Color**: Cyan (#00ffff)
- **Opacity**: 0.4 to 0.6 (animated)
- **Pattern**: From center (0,0) to each cardinal node

### Node Containers
- **Background**: Rgba(0, 0, 0, 0.9) - Semi-transparent black
- **Border**: 2px solid cyan
- **Shadow**: 0 0 40px rgba(0, 255, 255, 0.4)
- **Border-radius**: 16px

## Interaction Model

### Mouse Controls
```
┌─────────────────────────────────────────────┐
│ Click + Drag → Pan camera in any direction │
│ Mouse Wheel ↑ → Zoom out (max 300 units)   │
│ Mouse Wheel ↓ → Zoom in (min 50 units)     │
│ Menu Click → Smooth fly-in to node (GSAP)  │
└─────────────────────────────────────────────┘
```

### Camera Animation
- **Duration**: 1.5 seconds
- **Easing**: power2.inOut
- **Target Z**: 150 units (optimal viewing distance)

## Color Palette

```
Primary:     #00ffff (Cyan) - Main accent color
Background:  #000000 (Black) - Canvas background
Text:        #ffffff (White) - Primary text
Glow:        rgba(0, 255, 255, 0.4) - Shadow effects
Border:      #00ffff - Node borders
```

## Typography

```
Headers (H1):    2.5rem, cyan, glowing
Headers (H2):    2rem, cyan, glowing
Body Text:       1rem, white
Subtitles:       1.2rem, light cyan (#66ffff)
Font Family:     'Segoe UI', sans-serif
```

## Deployment Structure

```
/public_html/
├── index.html          (Main entry point)
├── canvas.js           (Canvas implementation)
├── config.js           (Password & config)
├── security.js         (Security measures)
├── data.js             (Encrypted user data)
└── CNAME              (Domain configuration)

External Resources:
├── Three.js (CDN)     → https://cdn.jsdelivr.net/npm/three@0.128.0
└── GSAP (CDN)         → https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2
```

## Performance Considerations

- **Target FPS**: 60 FPS on desktop
- **Render Loop**: RequestAnimationFrame
- **Optimizations**:
  - Single geometry per line
  - Reusable materials
  - Efficient sphere geometry (32x32 segments)
  - CSS2D for HTML content (GPU accelerated)

## Browser Requirements

✅ WebGL Support
✅ ES6 JavaScript
✅ CSS3 Transforms
✅ RequestAnimationFrame API

## Future Enhancements (Optional)

- [ ] Touch gesture support for mobile
- [ ] Particle effects background
- [ ] Grid overlay on canvas
- [ ] Minimap navigation helper
- [ ] Search functionality
- [ ] Keyboard shortcuts (arrow keys)
- [ ] More content nodes
- [ ] Dynamic content loading

---

**Note**: This mockup represents the final implementation. The actual rendered output will match this design when deployed with internet access for CDN resources.
