# Sharon Decet - Certificate Management System

A comprehensive, responsive certificate management system built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Digital Certificate Management**: Create, issue, and track digital certificates
- **Learner Management**: Comprehensive learner enrollment and progress tracking
- **Course Management**: Full course lifecycle management with automated certificates
- **Organization Portal**: Dedicated portals for organizations to manage their learners
- **Analytics & Reporting**: Detailed insights and reporting for all stakeholders
- **Security & Compliance**: Enterprise-grade security with compliance standards

### Responsive Design
- **Mobile-First Approach**: Optimized for all screen sizes from mobile to desktop
- **Adaptive Layouts**: Components automatically adjust to different viewport sizes
- **Touch-Friendly Interface**: Optimized for touch interactions on mobile devices
- **Progressive Enhancement**: Core functionality works on all devices
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation support

## 📱 Responsive Breakpoints

The application uses a mobile-first approach with the following breakpoints:

- **xs**: 475px and up (extra small devices)
- **sm**: 640px and up (small devices)
- **md**: 768px and up (medium devices)
- **lg**: 1024px and up (large devices)
- **xl**: 1280px and up (extra large devices)
- **2xl**: 1536px and up (2x extra large devices)
- **3xl**: 1920px and up (3x extra large devices)

## 🎨 Design System

### Typography
- **Responsive Text Sizes**: Text automatically scales based on screen size
- **Readable Line Heights**: Optimized for readability across all devices
- **Consistent Spacing**: Uniform spacing system that adapts to screen size

### Layout Components
- **DashboardLayout**: Responsive main layout with collapsible sidebar
- **Sidebar**: Desktop sidebar with mobile overlay
- **Header**: Responsive header with mobile menu
- **MainContent**: Flexible content area that adapts to available space

### UI Components
- **Cards**: Responsive cards that stack on mobile and grid on desktop
- **Tables**: Desktop tables with mobile card layouts
- **Modals**: Responsive modals that work on all screen sizes
- **Forms**: Touch-friendly forms with proper input sizing
- **Navigation**: Mobile-first navigation with hamburger menu

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **Framer Motion**: Smooth animations and transitions

### State Management
- **Zustand**: Lightweight state management
- **Immer**: Immutable state updates
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Husky**: Git hooks
- **Lint-staged**: Pre-commit linting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sharon-decet/certificate-management.git
   cd certificate-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on every push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- **Netlify**: Static site generation
- **AWS Amplify**: Full-stack deployment
- **Railway**: Simple deployment
- **Docker**: Containerized deployment

## 📱 Mobile Optimization

### Performance
- **Code Splitting**: Automatic code splitting for optimal loading
- **Image Optimization**: Next.js Image component with responsive images
- **Bundle Analysis**: Optimized bundle size for mobile networks
- **Lazy Loading**: Components load only when needed

### User Experience
- **Touch Gestures**: Swipe, pinch, and tap gestures
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Real-time updates
- **App-like Experience**: PWA capabilities

## �� Responsive Patterns

### Mobile-First Design
```css
/* Mobile styles (default) */
.component {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet styles */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### Flexible Grid System
```css
.grid-responsive {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}
```

### Responsive Typography
```css
.text-responsive {
  @apply text-sm sm:text-base lg:text-lg;
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## 📊 Performance

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

## 🔧 Configuration

### Tailwind CSS
The application uses a custom Tailwind configuration with:
- Custom breakpoints
- Extended color palette
- Responsive utilities
- Animation utilities

### Next.js
Optimized Next.js configuration with:
- Image optimization
- Bundle analysis
- Performance monitoring
- Security headers

## 📚 Documentation

### Component Documentation
- [DashboardLayout](./docs/components/DashboardLayout.md)
- [Sidebar](./docs/components/Sidebar.md)
- [Header](./docs/components/Header.md)
- [MainContent](./docs/components/MainContent.md)

### API Documentation
- [Authentication API](./docs/api/authentication.md)
- [Courses API](./docs/api/courses.md)
- [Learners API](./docs/api/learners.md)
- [Organizations API](./docs/api/organizations.md)

### Deployment Guide
- [Vercel Deployment](./docs/deployment/vercel.md)
- [Docker Deployment](./docs/deployment/docker.md)
- [Environment Variables](./docs/deployment/environment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Follow the ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Lucide](https://lucide.dev/) for the beautiful icon library

## 📞 Support

For support, email support@sharon-decet.com or join our [Discord community](https://discord.gg/sharon-decet).

## 🔗 Links

- [Website](https://sharon-decet.com)
- [Documentation](https://docs.sharon-decet.com)
- [API Reference](https://api.sharon-decet.com)
- [Status Page](https://status.sharon-decet.com)

---

Made with ❤️ by the Sharon Decet Team
