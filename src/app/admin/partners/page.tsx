'use client';
import * as React from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import StoreIcon from '@mui/icons-material/Store';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { generatePartnerCode, generateSecurePassword } from '@/utils/generators';
import { useRouter } from 'next/navigation';

interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [resettingPartner, setResettingPartner] = React.useState<Partner | null>(null);
  const [newPassword, setNewPassword] = React.useState('');
  const [editingPartner, setEditingPartner] = React.useState<Partner | null>(null);
  const [showPassword, setShowPassword] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Snackbar feedback state
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    partnerCode: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    password: '',
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/partners');
      const json = await res.json();
      if (json.success) {
        setPartners(json.data);
      } else {
        showFeedback(json.error || 'Failed to fetch partners', 'error');
      }
    } catch (err) {
      showFeedback('An error occurred while fetching partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPartners();
  }, []);

  const showFeedback = (msg: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleOpen = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        partnerCode: partner.partnerCode,
        name: partner.name,
        contactPerson: partner.contactPerson,
        email: partner.email,
        phone: partner.phone,
        location: partner.location,
        password: '••••••••',
      });
      setShowPassword(false);
    } else {
      setEditingPartner(null);
      setFormData({
        partnerCode: generatePartnerCode(''),
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        location: '',
        password: generateSecurePassword(),
      });
      setShowPassword(true);
    }
    setOpen(true);
  };

  const handleResetPassword = async (partner: Partner) => {
    const password = generateSecurePassword();
    try {
      const res = await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partner.id, password }),
      });
      const json = await res.json();
      if (json.success) {
        setResettingPartner(partner);
        setNewPassword(password);
        setShowPassword(true);
        setResetDialogOpen(true);
      } else {
        showFeedback(json.error || 'Failed to reset password', 'error');
      }
    } catch (err) {
      showFeedback('An error occurred while resetting password', 'error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResetDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.location.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      if (editingPartner) {
        const res = await fetch('/api/partners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPartner.id, ...formData }),
        });
        const json = await res.json();
        if (json.success) {
          setPartners(partners.map(p => p.id === editingPartner.id ? { ...editingPartner, ...formData } : p));
          showFeedback('Partner updated successfully');
          handleClose();
        } else {
          showFeedback(json.error || 'Failed to update partner', 'error');
        }
      } else {
        const res = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setPartners([...partners, json.data]);
          showFeedback(`Partner ${json.data.partnerCode} added successfully`);
          handleClose();
        } else {
          showFeedback(json.error || 'Failed to add partner', 'error');
        }
      }
    } catch (err) {
      showFeedback('An error occurred during submission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete partner "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/partners?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setPartners(partners.filter(p => p.id !== id));
        showFeedback(`Partner "${name}" deleted successfully`);
      } else {
        showFeedback(json.error || 'Failed to delete partner', 'error');
      }
    } catch (err) {
      showFeedback('An error occurred while deleting partner', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Partners Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ px: 3, py: 1, borderRadius: 2 }}>
          Add Partner
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="partners table">
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', pr: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No partners found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow key={partner.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Chip label={partner.partnerCode} color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {partner.name}
                    </TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{partner.phone}</TableCell>
                    <TableCell>{partner.location}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <IconButton color="secondary" onClick={() => router.push(`/admin/partners/${partner.partnerCode}/branches?name=${encodeURIComponent(partner.name)}`)} title="Manage Branches">
                        <StoreIcon />
                      </IconButton>
                      <IconButton color="warning" onClick={() => handleResetPassword(partner)} title="Reset Password">
                        <LockResetIcon />
                      </IconButton>
                      <IconButton color="info" onClick={() => router.push(`/admin/partners/${partner.partnerCode}/staff?name=${encodeURIComponent(partner.name)}`)} title="Manage Staff">
                        <BadgeIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleOpen(partner)} title="Edit Partner">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(partner.id, partner.name)} title="Delete Partner">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Partner Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>Account Credentials</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  name="partnerCode"
                  label="Generated Username"
                  fullWidth
                  value={formData.partnerCode}
                  slotProps={{
                    input: { readOnly: true },
                  }}
                  helperText="Unique login identifier"
                />
                <TextField
                  name="password"
                  label="Initial Password"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!!editingPartner || submitting}
                  slotProps={{
                    input: {
                      readOnly: !!editingPartner,
                      endAdornment: !editingPartner && (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  helperText={editingPartner ? "Password cannot be viewed here" : "Secure auto-generated password"}
                />
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>Partner Details</Typography>
              <TextField
                name="name"
                label="Partner Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
              />
              <TextField
                name="contactPerson"
                label="Contact Person"
                fullWidth
                required
                value={formData.contactPerson}
                onChange={handleChange}
                disabled={submitting}
              />
              <TextField
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  fullWidth
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  required
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {editingPartner ? 'Save Changes' : 'Add Partner'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Password Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleClose} maxWidth="xs" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Reset Partner Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A new secure password has been generated for <strong>{resettingPartner?.name}</strong>.
          </Typography>
          <TextField
            label="New Secure Password"
            fullWidth
            value={newPassword}
            type={showPassword ? 'text' : 'password'}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            helperText="Please share this new password with the partner."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="contained">Done</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
