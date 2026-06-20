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
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  thumbnail?: string;
}

export default function ProfilePage() {
  const [partner, setPartner] = React.useState<Partner | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    thumbnail: '',
  });

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  React.useEffect(() => {
    fetchPartner();
  }, []);

  const fetchPartner = async () => {
    try {
      const code = localStorage.getItem('partner-code') || 'QC-001';
      const res = await fetch('/api/partners');
      if (res.ok) {
        const json = await res.json();
        const found = json.data.find(
          (p: Partner) => p.partnerCode.toLowerCase() === code.toLowerCase()
        );
        if (found) {
          setPartner(found);
          setFormData({
            name: found.name,
            contactPerson: found.contactPerson,
            email: found.email,
            phone: found.phone,
            location: found.location,
            thumbnail: found.thumbnail || '',
          });
        }
      }
    } catch (error) {
      showSnackbar('Failed to load partner profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;

    setSaving(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partner.id,
          ...formData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSnackbar('Profile updated successfully!', 'success');
        // Refresh local data
        setPartner({ ...partner, ...formData });
      } else {
        showSnackbar(json.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred while updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const avatarLabel = formData.name ? formData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'PT';

  return (
    <Box sx={{ maxWidth: 'md' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Partner Profile
      </Typography>
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleUpdate}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center', mb: 4 }}>
            <Avatar 
              src={formData.thumbnail}
              sx={{ 
                width: 96, 
                height: 96, 
                fontSize: '2rem', 
                bgcolor: 'primary.main',
                border: '3px solid #e0e0e0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {avatarLabel}
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{formData.name || 'Business Name'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Partner Code: <strong>{partner?.partnerCode}</strong>
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 4 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Business Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactPerson"
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="thumbnail"
                label="Thumbnail Image URL"
                value={formData.thumbnail}
                onChange={handleChange}
                fullWidth
                helperText="Enter a URL path for the thumbnail logo asset (e.g., /images/partners/quick_clean_thumbnail.png)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Business Address"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={saving}
              sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 600 }}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
