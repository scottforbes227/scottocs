# Infinite Canvas UI - Deployment Instructions

## Overview
This project is a state-of-the-art infinite canvas UI built with Three.js and GSAP, featuring a futuristic neon aesthetic and smooth camera animations.

## Project Structure
```
/
├── index.html           # Main HTML file with password gate and canvas container
├── canvas.js            # Infinite Canvas implementation (Three.js + GSAP)
├── config.js            # Secure configuration module (password, birth date)
├── security.js          # Security measures (dev tools detection, etc.)
├── data.js              # Encrypted user data (countries, books)
├── style.css            # Legacy styles (not used in new design)
├── script.js            # Legacy script (not used in new design)
└── aero.jpg            # Background image (not used in new design)
```

## Features

### 1. Password Gate
- Black background with glowing cyan input field
- Smooth fade transition to canvas after successful authentication
- Password is securely stored in `config.js` (obfuscated)

### 2. Infinite Canvas
- **Center Node (0, 0)**: Hero section with "Scott Forbes"
- **North Node (0, 100)**: Work & Projects
- **East Node (100, 0)**: About section with facts
- **South Node (0, -100)**: Writing/Blog
- **West Node (-100, 0)**: Contact information

### 3. Navigation
- **Pan/Drag**: Click and drag to manually move the canvas
- **Mouse Wheel**: Zoom in/out (range: 50-300 units)
- **Menu Overlay**: Fixed navigation menu with smooth fly-in animations to each section

### 4. Visual Effects
- Glowing neon cyan spheres at each node
- Pulsating glow effects
- Connecting lines between center and outer nodes with animated opacity
- Futuristic black background with subtle fog

## Deployment to Namecheap

### Prerequisites
1. Active Namecheap hosting account with FTP access
2. FTP credentials (hostname, username, password)

### Option 1: Manual FTP Upload

1. **Connect to your FTP server**:
   - Host: Your Namecheap FTP hostname (e.g., `ftp.yourdomain.com`)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTPS)

2. **Upload files to `/public_html/`**:
   ```
   /public_html/
   ├── index.html
   ├── canvas.js
   ├── config.js
   ├── security.js
   ├── data.js
   └── CNAME (if using custom domain)
   ```

3. **Set file permissions**:
   - All files: 644 (read/write for owner, read for others)
   - Directories: 755 (if any)

4. **Test the deployment**:
   - Visit your domain (e.g., `https://yourdomain.com`)
   - Enter password to access the canvas

### Option 2: GitHub Actions (Automated)

The repository includes a GitHub Actions workflow for automatic deployment on push to `main`.

1. **Configure GitHub Secrets**:
   Go to your repository settings → Secrets and add:
   - `NAMECHEAP_FTP_HOST`: Your FTP hostname
   - `NAMECHEAP_FTP_USERNAME`: Your FTP username
   - `NAMECHEAP_FTP_PASSWORD`: Your FTP password

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Monitor deployment**:
   - Check Actions tab in GitHub
   - Workflow will automatically upload files via FTPS

### Option 3: FileZilla (GUI)

1. Download and install [FileZilla](https://filezilla-project.org/)
2. Create new connection:
   - Protocol: FTP - File Transfer Protocol
   - Host: Your Namecheap FTP hostname
   - Encryption: Use explicit FTP over TLS
   - Port: 21
   - Logon Type: Normal
   - User/Password: Your FTP credentials

3. Connect and upload files to `/public_html/`

## Configuration

### Changing the Password
Edit `config.js` and update the obfuscated password:
```javascript
// Current password is "helloworld"
// To change, encode your new password using ROT13 then base64
```

### Customizing Node Content
Edit `canvas.js` and modify the `createNodes()` method:
```javascript
this.createNode('work', this.nodePositions.work,
    '<h2 class="node-title">Your Title</h2>' +
    '<p class="node-content">Your content here...</p>');
```

### Adjusting Node Positions
Modify node positions in `canvas.js`:
```javascript
this.nodePositions = {
    center: { x: 0, y: 0, z: 0 },
    work: { x: 0, y: 150, z: 0 },    // Move further north
    about: { x: 150, y: 0, z: 0 },   // Move further east
    // ... etc
};
```

### Changing Colors
Update the color scheme in `index.html` (CSS) and `canvas.js`:
```javascript
// In canvas.js
color: 0x00ffff  // Cyan - change to your preferred hex color
```

```css
/* In index.html */
border: 2px solid #00ffff;  /* Change to your color */
```

## Browser Compatibility

### Supported Browsers
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

### Required Features
- WebGL support
- ES6 JavaScript
- CSS3 animations

### Not Supported
- Internet Explorer (any version)
- Very old mobile browsers

## Performance Optimization

### Desktop (Recommended)
- Optimized for 1920x1080 and higher
- Smooth 60 FPS animations
- Full visual effects enabled

### Mobile (Basic Support)
The canvas will work on mobile devices but is not optimized for:
- Touch gestures (use mouse for best experience)
- Small screens
- Limited GPU performance

## Troubleshooting

### Issue: White/blank screen after password
**Solution**: Check browser console for errors. Ensure Three.js and GSAP CDN links are accessible.

### Issue: Password not working
**Solution**: 
1. Check `config.js` is uploaded
2. Default password is "helloworld"
3. Clear browser cache

### Issue: Canvas not showing
**Solution**:
1. Check browser WebGL support: visit `https://get.webgl.org/`
2. Enable hardware acceleration in browser settings
3. Update graphics drivers

### Issue: Slow performance
**Solution**:
1. Close other browser tabs
2. Reduce browser zoom to 100%
3. Try a different browser (Chrome recommended)

## Security Notes

- Password is obfuscated but not truly encrypted
- For production use, consider server-side authentication
- The security.js file prevents dev tools access (development only)
- All sensitive data is loaded only after authentication

## Maintenance

### Updating Content
1. Edit `canvas.js` for node content
2. Edit `data.js` for countries/books data (base64 encoded)
3. Re-upload modified files via FTP

### Backup
Keep backups of:
- `config.js` (contains password)
- `data.js` (contains personal data)
- `index.html` (main structure)
- `canvas.js` (canvas logic)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test on a different browser
4. Clear cache and hard reload (Ctrl+Shift+R)

## Credits

- **Three.js**: 3D graphics library
- **GSAP**: Animation library
- **Design**: Futuristic neon aesthetic
- **Hosting**: Namecheap shared hosting

---

## Quick Start Checklist

- [ ] Upload all files to `/public_html/`
- [ ] Verify file permissions (644 for files)
- [ ] Test password gate (default: "helloworld")
- [ ] Check canvas loads after authentication
- [ ] Test all navigation menu items
- [ ] Verify pan/drag controls work
- [ ] Test on multiple browsers
- [ ] Bookmark/save your password

**Deployment Complete!** 🚀
