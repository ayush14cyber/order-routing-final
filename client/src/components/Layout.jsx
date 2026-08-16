import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Button } from '@mui/material';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Warehouse, Package, ShoppingCart, Map, LogOut, Settings, History } from 'lucide-react';

const drawerWidth = 240;

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard />, path: '/', roles: ['admin'] },
    { text: 'Warehouses', icon: <Warehouse />, path: '/warehouses', roles: ['admin'] },
    { text: 'Inventory', icon: <Package />, path: '/inventory', roles: ['admin', 'manager'] },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders', roles: ['admin', 'manager'] },
    { text: 'Routing History', icon: <History />, path: '/routing-history', roles: ['admin', 'manager'] },
    { text: 'Map', icon: <Map />, path: '/map', roles: ['admin', 'manager'] },
    { text: 'Routing Settings', icon: <Settings />, path: '/routing-settings', roles: ['admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            Routing Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role: {user?.role}
          </Typography>
        </Box>
        <List sx={{ flexGrow: 1 }}>
          {visibleMenuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                borderRight: location.pathname === item.path ? '3px solid #7c3aed' : 'none',
                '&:hover': { backgroundColor: 'rgba(124, 58, 237, 0.08)' }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary" 
            startIcon={<LogOut />}
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
