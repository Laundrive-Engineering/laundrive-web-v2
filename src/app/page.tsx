'use client';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Link from 'next/link';

export default function Home() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        color: 'white',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Laundrive
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, maxWidth: 600 }}>
        The complete laundry management platform for administrators and partners.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': { bgcolor: '#f5f5f5' },
            px: 4,
            py: 1.5,
          }}
        >
          Get Started
        </Button>
        <Button
          component={Link}
          href="/login"
          variant="outlined"
          size="large"
          sx={{
            borderColor: 'white',
            color: 'white',
            '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
            px: 4,
            py: 1.5,
          }}
        >
          Login
        </Button>
      </Stack>
    </Box>
  );
}
