# Deploy Game of Strife to Vercel

## Quick Deploy Options:

### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from project directory:**
   ```bash
   cd "D:\Documents\11Projects\Game-of-Strife-Standalone"
   vercel
   ```
   
3. **Follow the prompts:**
   - "Set up and deploy?" → **Yes**
   - "Which scope?" → **Your account**
   - "Link to existing project?" → **No**
   - "What's your project's name?" → **game-of-strife** (or any name)
   - "In which directory is your code located?" → **./. (current directory)**
   - Framework detection should detect **Vite**
   - Build command should be **npm run build**
   - Output directory should be **dist**

4. **Your game will be live at the URL provided!**

### Option B: GitHub + Vercel (Alternative)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/game-of-strife.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Deploy automatically

### Option C: Netlify Drop (Simplest)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Go to https://netlify.com/drop
   - Drag and drop the `dist` folder
   - Get instant live URL!

## Configuration

The project is already configured with:
- ✅ `vercel.json` for proper routing
- ✅ Production build settings
- ✅ Mobile and desktop responsive design
- ✅ Game recording and replay system

## Testing

Once deployed, test:
- 🎮 **Training Mode** - Play solo games
- 🎮 **2-Player Battle** - Test with your friend
- 🎬 **Replay Games** - View recorded games
- 📱 **Mobile Support** - Test on phones/tablets
- 🖥️ **Desktop Support** - Test on different screen sizes

## Share with Friends

After deployment, you'll get a URL like:
- `https://game-of-strife-abc123.vercel.app`
- `https://wonderful-game-456789.netlify.app`

Share this URL with friends for instant multiplayer testing!

## Notes

- Game data is stored locally in each browser
- Each player will have their own game history
- Perfect for testing 2-player battles remotely
- Works on all devices with modern browsers