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
  IconButton,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  logo?: string;
  banner?: string;
}

export default function ProfilePage() {
  const [partner, setPartner] = React.useState<Partner | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    logo: '',
    banner: '',
  });

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

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
            logo: found.logo || found.thumbnail || '',
            banner: found.banner || '',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !partner) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('type', type);
      uploadData.append('partnerCode', partner.partnerCode);

      const res = await fetch('/api/partners/upload', {
        method: 'POST',
        body: uploadData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Now PATCH the database with the new URL
        const patchRes = await fetch('/api/partners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: partner.id,
            [type]: json.url,
          }),
        });

        const patchJson = await patchRes.json();
        if (patchRes.ok && patchJson.success) {
          showSnackbar(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded and updated successfully!`, 'success');
          setFormData(prev => ({ ...prev, [type]: json.url }));
        } else {
          showSnackbar(patchJson.error || 'Failed to update image path', 'error');
        }
      } else {
        showSnackbar(json.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred during file upload', 'error');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
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

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={logoInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, 'logo')}
      />
      <input
        type="file"
        accept="image/*"
        ref={bannerInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, 'banner')}
      />

      <Paper sx={{ mb: 4, overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {/* Banner Section */}
        <Box 
          sx={{ 
            height: 200, 
            background: formData.banner 
              ? `url(${formData.banner}) center/cover no-repeat` 
              : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 90%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0, right: 0, bottom: 0, left: 0,
              bgcolor: 'rgba(0,0,0,0.15)'
            }
          }}
        >
          {uploadingBanner && (
            <CircularProgress sx={{ zIndex: 2, color: 'white' }} />
          )}
          <IconButton 
            onClick={() => bannerInputRef.current?.click()}
            sx={{ 
              position: 'absolute', 
              right: 16, 
              bottom: 16, 
              bgcolor: 'rgba(255,255,255,0.85)',
              '&:hover': { bgcolor: '#ffffff' },
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            title="Upload Banner Image"
          >
            <PhotoCameraIcon />
          </IconButton>
        </Box>

        {/* Profile Details Block with overlapping logo */}
        <Box sx={{ p: 4, pt: 0, position: 'relative' }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            sx={{ 
              alignItems: { xs: 'center', sm: 'flex-end' }, 
              mt: -6,
              mb: 4
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={formData.logo}
                sx={{ 
                  width: 110, 
                  height: 110, 
                  fontSize: '2.5rem', 
                  bgcolor: 'primary.main',
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  '&:hover .logo-overlay': { opacity: 1 }
                }}
                onClick={() => logoInputRef.current?.click()}
              >
                {avatarLabel}
              </Avatar>
              {uploadingLogo ? (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    borderRadius: '50%'
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => logoInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, pb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formData.name || 'Business Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Partner Code: <strong>{partner?.partnerCode}</strong>
              </Typography>
            </Box>
          </Stack>
          
          <Divider sx={{ mb: 4 }} />
          
          <form onSubmit={handleUpdate}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  name="logo"
                  label="Logo Image URL"
                  value={formData.logo}
                  onChange={handleChange}
                  fullWidth
                  helperText="Editable URL path (automatically updated on upload)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="banner"
                  label="Banner Image URL"
                  value={formData.banner}
                  onChange={handleChange}
                  fullWidth
                  helperText="Editable URL path (automatically updated on upload)"
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
                {saving ? 'Saving...' : 'Update Details'}
              </Button>
            </Box>
          </form>
        </Box>
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
