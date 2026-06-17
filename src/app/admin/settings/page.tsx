'use client';
import * as React from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';

export default function SettingsPage() {
  return (
    <Box sx={{ maxWidth: 'md' }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>General Configuration</Typography>
        <Stack spacing={3}>
          <TextField label="Platform Name" defaultValue="Laundrive" fullWidth />
          <TextField label="Support Email" defaultValue="support@laundrive.com" fullWidth />
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
          <FormControlLabel control={<Switch defaultChecked />} label="Email notifications for new partners" />
          <FormControlLabel control={<Switch defaultChecked />} label="System maintenance alerts" />
        </Stack>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained">Save Settings</Button>
        </Box>
      </Paper>
    </Box>
  );
}
