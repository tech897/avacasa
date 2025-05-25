# Avacasa - Holiday Homes & Vacation Real Estate Platform

A modern, responsive web application for vacation real estate built with Next.js 14, TypeScript, and Tailwind CSS.

## 🏡 About Avacasa

Avacasa is a comprehensive platform for discovering and investing in curated holiday homes and managed farmlands across India's most beautiful destinations. From serene beaches in Goa to misty hills in Coorg, we help you find the perfect vacation property.

## ✨ Features

### Core Features
- **Property Listings**: Browse holiday homes, farmlands, villas, and plots
- **Location-based Search**: Explore properties by destination
- **Advanced Filtering**: Filter by price, property type, bedrooms, amenities
- **Property Details**: Comprehensive property information with image galleries
- **Inquiry Management**: Contact forms and WhatsApp integration
- **Responsive Design**: Optimized for all devices

### Advanced Features
- **SEO Optimized**: Built-in SEO with meta tags and structured data
- **Performance Optimized**: Image optimization and lazy loading
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Beautiful design with Tailwind CSS
- **Database Integration**: PostgreSQL with Prisma ORM
- **API Routes**: RESTful API endpoints

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Inter & Playfair Display

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Forms**: React Hook Form

### Development
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Formatting**: Prettier (recommended)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avacasa-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/avacasa_db"
   
   # Next.js
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   NEXT_PUBLIC_SITE_NAME="Avacasa"
   
   # Google Maps (optional)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
   
   # WhatsApp Integration
   NEXT_PUBLIC_WHATSAPP_NUMBER="+91XXXXXXXXXX"
   
   # Email Service (optional)
   SENDGRID_API_KEY="your_sendgrid_api_key"
   SENDGRID_FROM_EMAIL="noreply@avacasa.life"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
avacasa-nextjs/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   ├── contact/           # Contact page
│   │   ├── properties/        # Properties listing
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   ├── property/         # Property-related components
│   │   ├── location/         # Location-related components
│   │   └── home/             # Homepage components
│   ├── lib/                  # Utility libraries
│   ├── types/                # TypeScript type definitions
│   └── hooks/                # Custom React hooks
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── tailwind.config.ts        # Tailwind CSS configuration
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#5A67D8)
- **Secondary**: Teal (#319795)
- **Accent**: Orange (#ED8936)
- **Gray Scale**: Comprehensive gray palette

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Components
All components follow a consistent design system with:
- Proper spacing and typography
- Hover states and transitions
- Responsive design
- Accessibility considerations

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)

### Database Management
```bash
# View database in browser
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Other optional variables as needed

## 📱 Features Overview

### Homepage
- Hero section with search functionality
- Featured locations showcase
- Featured properties grid
- Benefits section
- Customer testimonials
- Call-to-action sections

### Properties Page
- Advanced search and filtering
- Property grid with pagination
- Quick filter buttons
- Loading states and empty states

### Contact Page
- Contact form with validation
- Office information
- FAQ section
- Map integration placeholder

### Property Cards
- Image galleries
- Property details (beds, baths, area)
- Price display
- Amenities preview
- Action buttons (View Details, Inquire)

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Property favorites/wishlist
- [ ] Virtual property tours
- [ ] Payment gateway integration
- [ ] Admin dashboard
- [ ] Blog system
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced map integration
- [ ] Property comparison tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: info@avacasa.life
- Phone: +91 12345 67890
- WhatsApp: Available through the website

---

Built with ❤️ for vacation real estate enthusiasts
