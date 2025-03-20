import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

// Material UI imports
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Container,
  Button,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate('/admin/login');
    setDrawerOpen(false);
  };

  // All admin roles can access these
  const baseMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Orders', icon: <ReceiptIcon />, path: '/admin/orders' }
  ];

  // Role-specific menu items
  const superAdminItems = [
    { text: 'Menu Management', icon: <MenuBookIcon />, path: '/admin/menu' },
    { text: 'Admin Logs', icon: <AssessmentIcon />, path: '/admin/logs' }
  ];

  const contentManagerItems = [
    { text: 'Menu Management', icon: <MenuBookIcon />, path: '/admin/menu' }
  ];

  // Determine which extra menu items to show based on role
  const getRoleBasedMenuItems = () => {
    if (!admin) return [];
    
    switch (admin.role) {
      case 'SUPER_ADMIN':
        return superAdminItems;
      case 'CONTENT_MANAGER':
        return contentManagerItems;
      default:
        return [];
    }
  };

  const menuItems = [...baseMenuItems, ...getRoleBasedMenuItems()];

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Box className="admin-info">
        <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h6">{admin?.username || 'Admin'}</Typography>
        {admin && (
          <Chip 
            label={admin.role.replace('_', ' ')} 
            color="primary" 
            size="small" 
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={NavLink} 
            to={item.path} 
            className={location.pathname === item.path ? 'active-nav-link' : ''}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box className="drawer-footer">
        <Button 
          onClick={handleLogout} 
          startIcon={<LogoutIcon />}
          color="primary"
          variant="outlined"
          fullWidth
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <div className="admin-layout">
      <AppBar position="fixed" color="primary">
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
            to="/admin" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Restaurant Admin
          </Typography>

          {admin && (
            <Chip 
              label={admin.role.replace('_', ' ')} 
              color="secondary" 
              size="small" 
              sx={{ mr: 2 }}
            />
          )}

          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      <main className="admin-main-content">
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </main>
      
      <footer className="admin-footer">
        <Container maxWidth="lg">
          <Typography variant="body2" color="textSecondary" align="center">
            © {new Date().getFullYear()} Restaurant Admin Panel. All rights reserved.
          </Typography>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout;
