# 🐝 BeeYield - Honey Traceability & E-commerce Platform

BeeYield is a comprehensive platform for honey traceability, e-commerce, and beekeeping services. Built with modern technologies to ensure transparency from hive to table.

## 🌟 Features

- 🔍 **Blockchain-based Traceability** - Track honey from hive to table
- 🛒 **E-commerce Platform** - Buy authentic honey and bee products
- 📊 **Analytics Dashboard** - Track business metrics and user behavior
- 🔐 **Secure Authentication** - User accounts with JWT tokens
- 💳 **Multiple Payment Options** - Stripe (international) and M-Pesa (Kenya)
- 📧 **Email Notifications** - Order confirmations and updates
- 🌍 **International & Local** - Serves both Kenyan and international markets

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/nduva15/BeeYield.git
cd BeeYield

# Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (see SETUP_GUIDE.md)

# Run the application
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload

# Terminal 2 - Frontend
npm run dev
```

Visit http://localhost:5173 to see the app!

## 📚 Documentation

### 🎯 Start Here
- **[Configuration Report](CONFIGURATION_REPORT.md)** - Quick overview of what's configured and what's missing
- **[Setup Guide](SETUP_GUIDE.md)** - Step-by-step setup instructions

### 📖 Detailed Documentation
- **[Connections Checklist](CONNECTIONS_CHECKLIST.md)** - Complete reference for all API keys and services
- **[Complete Guide](COMPLETE_GUIDE.md)** - Full technical documentation
- **[Backend Guide](backend_guide_and_prds.md)** - Backend architecture and API reference

## 🔌 Required Services

### Essential (for basic functionality)
- ✅ **Supabase** - Database and authentication
- ✅ **ClickHouse** - Analytics database
- ⚠️ **SECRET_KEY** - Must be changed from default!

### Optional (for full features)
- ⚡ **Stripe** - International credit/debit card payments
- 📱 **M-Pesa** - Kenyan mobile money payments
- 📧 **Email Service** - SMTP or Resend for notifications

## 🧪 Test Your Configuration

Run the automated connection test:

```bash
python test_all_connections.py
```

This will check all your services and tell you what needs attention.

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- TanStack Query for data fetching
- React Router for navigation

### Backend
- Python 3.11 + FastAPI
- Supabase (PostgreSQL) for data storage
- ClickHouse for analytics
- Custom Python blockchain for traceability
- JWT authentication

### Deployment
- Frontend: Vercel
- Backend: Vercel Serverless Functions / Render
- Database: Supabase Cloud
- Analytics: ClickHouse Cloud

## 📦 Project Structure

```
BeeYield/
├── src/                    # Frontend React application
├── backend/                # Python FastAPI backend
│   ├── app/               # Application code
│   ├── migrations/        # Database migrations
│   └── main.py           # Backend entry point
├── api/                   # Vercel serverless functions
├── public/                # Static assets
└── docs/                  # Documentation files
```

## 🔐 Security

- JWT-based authentication
- Row-level security in Supabase
- HTTPS enforced in production
- API key encryption
- CORS protection

**Important:** Change the `SECRET_KEY` before production deployment!

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed deployment instructions.

## 🐛 Troubleshooting

**Connection issues?**
```bash
python test_all_connections.py
```

**Module not found?**
```bash
npm install  # Frontend
pip install -r backend/requirements.txt  # Backend
```

**CORS errors?**
- Check `backend/app/core/config.py` CORS settings
- Add your domain to allowed origins

See [CONFIGURATION_REPORT.md](CONFIGURATION_REPORT.md) for more troubleshooting tips.

## 📊 Current Status

Check [CONFIGURATION_REPORT.md](CONFIGURATION_REPORT.md) for:
- ✅ What's currently working
- ⚠️ What needs attention
- ❌ What's missing
- 📝 Action items for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

[Add your license here]

## 🆘 Support

- Check the documentation files for detailed guides
- Run `python test_all_connections.py` to diagnose issues
- Review application logs for error messages

## 🎉 Credits

Built with ❤️ for sustainable beekeeping and transparent honey sourcing.

---

**Quick Links:**
- [Setup Guide](SETUP_GUIDE.md) - Get started in 30 minutes
- [Configuration Report](CONFIGURATION_REPORT.md) - See what's configured
- [Connections Checklist](CONNECTIONS_CHECKLIST.md) - All API keys explained
- [Test Connections](test_all_connections.py) - Automated testing
