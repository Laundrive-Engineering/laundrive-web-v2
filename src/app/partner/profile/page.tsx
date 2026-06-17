'use client';
import * as React from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Avatar,
  Grid,
  Divider,
} from '@mui/material';

export default function ProfilePage() {
  return (
    <Box sx={{ maxWidth: 'md' }}>
      <Typography variant="h4" gutterBottom>
        Partner Profile
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>QC</Avatar>
          <Box>
            <Typography variant="h5">Quick Clean Services</Typography>
            <Typography variant="body2" color="text.secondary">Partner Code: QC-001</Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Business Name" defaultValue="Quick Clean Services" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Contact Person" defaultValue="John Doe" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Email Address" defaultValue="contact@quickclean.com" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Phone Number" defaultValue="09123456789" fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Business Address" defaultValue="123 Main St, Cebu City" fullWidth multiline rows={2} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained">Update Profile</Button>
        </Box>
      </Paper>
    </Box>
  );
}
