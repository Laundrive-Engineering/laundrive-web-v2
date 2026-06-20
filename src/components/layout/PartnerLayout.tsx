'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const [partnerName, setPartnerName] = React.useState('Laundrive Partner');
  const router = useRouter();

  React.useEffect(() => {
    const storedName = localStorage.getItem('partner-name');
    if (storedName) {
      setPartnerName(storedName);
    }
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/partner' },
    { text: 'Orders', icon: <ShoppingCartIcon />, href: '/partner/orders' },
    { text: 'Services', icon: <LocalLaundryServiceIcon />, href: '/partner/services' },
    { text: 'Branches', icon: <StoreIcon />, href: '/partner/branches' },
    { text: 'Staff', icon: <AccountCircleIcon />, href: '/partner/staff' },
    { text: 'Profile', icon: <AccountCircleIcon />, href: '/partner/profile' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {partnerName}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} href={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
}
