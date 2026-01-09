# BeeYield Website - Quick Start

This repository contains the BeeYield website - a platform for honey traceability, pollination services, and sustainable beekeeping.

## 🌐 Live Website

**Production URL**: https://beeyield.com/

> **Note**: If the website is not loading, please follow the [Deployment Guide](./DEPLOYMENT.md) and [Troubleshooting Guide](./TROUBLESHOOTING.md).

## 🚀 Quick Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/nduva15/BeeYield.git
   cd BeeYield
   ```

2. **Install dependencies**
   ```bash
   npm ci --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_URL=http://localhost:8080
   VITE_API_URL=/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:8080 in your browser.

## 🏗️ Build & Deploy

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Production

The website deploys automatically to **Hostinger** when you push to the `main` branch.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📁 Project Structure

```
BeeYield/
├── src/                    # React source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   └── lib/              # Utilities and libraries
├── public/               # Static assets
├── dist/                 # Production build (generated)
├── backend/              # Python/FastAPI backend
├── .github/workflows/    # GitHub Actions CI/CD
└── docs/                 # Documentation

```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🛠️ Technologies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Supabase** - Backend as a Service
- **React Query** - Data fetching

### Backend (Optional)
- **Python/FastAPI** - API server
- **PostgreSQL** - Database
- **Blockchain** - Custom honey traceability

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy the website
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Fix common issues
- [Complete Backend Guide](./COMPLETE_GUIDE.md) - Backend and blockchain documentation

## 🐛 Troubleshooting

### Website not loading?

1. **Check DNS**: Run `nslookup beeyield.com`
2. **Check deployment**: Look at GitHub Actions tab
3. **Check logs**: Review browser console for errors

For detailed troubleshooting steps, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

### Build fails?

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Try building again
npm run build
```

### Development server issues?

```bash
# Clear cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

## 🔐 Environment Variables

### Required Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_APP_URL` - Your app URL (https://beeyield.com for production)
- `VITE_API_URL` - API endpoint URL

### Where to Set Them

- **Local Development**: `.env` file in project root
- **Production Build**: `.env.production` file (committed to repo)
- **GitHub Actions**: Repository secrets (Settings → Secrets)

## 🚦 Deployment Status

The site uses GitHub Actions for continuous deployment:

- **Trigger**: Push to `main` branch
- **Target**: Hostinger hosting via SSH/SCP
- **Build**: Vite production build
- **Deploy**: Files uploaded to `public_html/`

Check deployment status in the [Actions](../../actions) tab.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally: `npm run build && npm run preview`
4. Commit: `git commit -m "Description of changes"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request to `main`

## 📞 Support

### Issues with Deployment
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Contact Hostinger support for server issues

### Issues with Code
- Open a GitHub issue
- Include error messages and steps to reproduce

### DNS/Domain Issues
- Contact your domain registrar
- Review DNS configuration section in DEPLOYMENT.md

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Hosted on Hostinger
- Backend powered by Supabase
