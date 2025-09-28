import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { formatUserName } from '../lib/formatName';
import { 
  Navbar as ResizableNavbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle, 
  NavbarButton 
} from './ui/resizable-navbar';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const [activeLink, setActiveLink] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', name: 'Home', target: 'hero', path: '/' },
    { id: 'about', name: 'About', target: 'about', path: '/' },
    { id: 'impact', name: 'Impact', target: 'reviews', path: '/' },
    { id: 'dashboard', name: 'Dashboard', target: null, path: '/dashboard' }
  ];

  const scrollToSection = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleNavClick = (item) => {
    setActiveLink(item.id);
    
    if (item.id === 'dashboard') {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }
      navigate('/dashboard');
      return;
    }
    
    // For Home, About, and Impact - navigate to home page first, then scroll
    if (item.path === '/') {
      navigate('/');
      // Small delay to ensure navigation completes before scrolling
      setTimeout(() => {
        if (item.target) {
          scrollToSection(item.target);
        }
      }, 100);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (item) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return activeLink === item.id;
  };

  return (
    <ResizableNavbar>
      {/* Desktop Navbar */}
      <NavBody>
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="ml-2 text-xl font-bold text-white">MedTech</span>
        </div>

        {/* Navigation Items */}
        <NavItems 
          items={navItems} 
          onItemClick={handleNavClick}
        />

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-accent transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-white">
                  {formatUserName(user)}
                </span>
              </div>
              <NavbarButton onClick={handleSignOut} variant="secondary">
                <LogOut className="w-4 h-4" />
              </NavbarButton>
            </>
          ) : (
            <NavbarButton onClick={() => setShowAuthModal(true)} variant="primary">
              Sign In
            </NavbarButton>
          )}
        </div>
      </NavBody>

      {/* Mobile Navbar */}
      <MobileNav>
        <MobileNavHeader>
          {/* Mobile Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="ml-2 text-xl font-bold text-white">MedTech</span>
          </div>

          {/* Mobile Menu Toggle */}
          <MobileNavToggle 
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        {/* Mobile Menu */}
        <MobileNavMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNavClick(item);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive(item)
                  ? 'text-blue-300 bg-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.name}
            </button>
          ))}
          
          {/* Mobile User Actions */}
          <div className="pt-4 border-t border-border">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {formatUserName(user)}
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 rounded-full hover:bg-accent transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
};

export default Navbar;
