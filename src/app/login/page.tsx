'use client';
import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
  Paper,
  Avatar,
  Tab,
  Tabs,
  Snackbar,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface Account {
  email?: string;
  username?: string;
  password: string;
  role: string;
  type: number;
}

const ACCOUNTS: Account[] = [
  { email: 'superadmin@laundrive.com', password: 'Laundrive@Super2026!Admin', role: 'super-admin', type: 0 },
  { email: 'admin@laundrive.com', password: 'Laundrive#Admin2026%Secure', role: 'admin', type: 0 },
];

export default function LoginPage() {
  const [value, setValue] = React.useState(0);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'info' | 'error'>('info');
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setOpenSnackbar(false);
  };

  const handleForgotPassword = (event: React.MouseEvent) => {
    event.preventDefault();
    if (value === 1) {
      setSnackbarSeverity('info');
      setSnackbarMessage('Please contact Laundrive at support@laundrive.com');
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const identifier = data.get('identifier');
    const password = data.get('password');

    const account = ACCOUNTS.find(
      (acc) => 
        (value === 0 ? acc.email === identifier : acc.username === identifier) && 
        acc.password === password && 
        acc.type === value
    );

    if (account) {
      localStorage.setItem('user-role', account.role);
      if (account.type === 0) {
        router.push('/admin');
      } else {
        router.push('/partner');
      }
    } else {
      setSnackbarSeverity('error');
      setSnackbarMessage('Invalid email or password for this account type.');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Laundrive Login
          </Typography>

          <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={value} onChange={handleChange} variant="fullWidth" aria-label="login tabs">
              <Tab label="Admin" id="login-tab-0" />
              <Tab label="Partner" id="login-tab-1" />
            </Tabs>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <CustomTabPanel value={value} index={0}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Access the administrative control panel.
              </Typography>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Manage your laundry business operations.
              </Typography>
            </CustomTabPanel>

            <TextField
              margin="normal"
              required
              fullWidth
              id="identifier"
              label={value === 0 ? "Email Address" : "Username"}
              name="identifier"
              autoComplete={value === 0 ? "email" : "username"}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>
            <Grid container sx={{ justifyContent: 'flex-end' }}>
              <Grid>
                <Link href="#" variant="body2" onClick={handleForgotPassword}>
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Typography variant="body2" color="white" align="center" sx={{ mt: 5 }}>
          {'Copyright © '}
          <Link color="inherit" href="/">
            Laundrive
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
}
