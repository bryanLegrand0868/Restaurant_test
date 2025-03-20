import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './UserLayout.css';

// Material UI imports
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Box,
  Container,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const UserLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Menu', icon: <RestaurantMenuIcon />, path: '/menu' },
    { text: 'Cart', icon: <ShoppingCartIcon />, path: '/cart', badge: totalItems }
  ];

  const authenticatedMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Orders', icon: <HistoryIcon />, path: '/orders' }
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      {isAuthenticated && (
        <Box className="user-info">
          <Avatar 
            src={user.profilePhoto} 
            alt={user.name} 
            sx={{ width: 60, height: 60 }}
          />
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2">{user.email}</Typography>
        </Box>
      )}
      
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={NavLink} to={item.path} className={({ isActive }) => isActive ? 'active-nav-link' : ''}>
            <ListItemIcon>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="primary">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        {isAuthenticated && authenticatedMenuItems.map((item) => (
          <ListItem button key={item.text} component={NavLink} to={item.path} className={({ isActive }) => isActive ? 'active-nav-link' : ''}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box className="drawer-footer">
        {isAuthenticated ? (
          <Button 
            onClick={handleLogout} 
            startIcon={<LogoutIcon />}
            color="primary"
            variant="outlined"
            fullWidth
          >
            Logout
          </Button>
        ) : (
          <Button 
            component={NavLink} 
            to="/login" 
            startIcon={<LoginIcon />}
            color="primary"
            variant="contained"
            fullWidth
            onClick={toggleDrawer(false)}
          >
            Login
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <div className="user-layout">
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <RestaurantIcon sx={{ mr: 1 }} />
          <Typography 
            variant="h6" 
            component={NavLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Delicious Delivery
          </Typography>

          <IconButton 
            color="inherit" 
            component={NavLink} 
            to="/cart"
            aria-label="cart"
          >
            <Badge badgeContent={totalItems} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <IconButton 
              color="inherit" 
              component={NavLink} 
              to="/profile"
              aria-label="profile"
            >
              <Avatar 
                src={user.profilePhoto} 
                alt={user.name} 
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          ) : (
            <Button 
              component={NavLink} 
              to="/login" 
              color="inherit"
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      <main className="main-content">
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </main>
      
      <footer className="footer">
        <Container maxWidth="lg">
          <Typography variant="body2" color="textSecondary" align="center">
            © {new Date().getFullYear()} Delicious Delivery. All rights reserved.
          </Typography>
        </Container>
      </footer>
    </div>
  );
};

export default UserLayout;
