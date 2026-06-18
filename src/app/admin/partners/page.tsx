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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
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

const initialPartners: Partner[] = [
  { id: 1, partnerCode: 'QC-001', name: 'Quick Clean', contactPerson: 'John Doe', email: 'contact@quickclean.com', phone: '09123456789', location: 'Cebu City' },
  { id: 2, partnerCode: 'LD-002', name: 'Laundry Day', contactPerson: 'Jane Smith', email: 'info@laundryday.ph', phone: '09987654321', location: 'Mandaue City' },
];

export default function PartnersPage() {
  const [partners, setPartners] = React.useState<Partner[]>(initialPartners);
  const [open, setOpen] = React.useState(false);
  const [editingPartner, setEditingPartner] = React.useState<Partner | null>(null);
  const [showPassword, setShowPassword] = React.useState(true);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
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

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      setPartners(partners.map(p => p.id === editingPartner.id ? { ...editingPartner, ...formData } : p));
      setSnackbarMessage('Partner updated successfully');
    } else {
      const newPartner = {
        id: partners.length + 1,
        ...formData,
      };
      setPartners([...partners, newPartner]);
      setSnackbarMessage(`Partner ${formData.partnerCode} added successfully`);
    }
    setOpenSnackbar(true);
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      setPartners(partners.filter(p => p.id !== id));
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Partners Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Partner
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="partners table">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell>
                  <Chip label={partner.partnerCode} color="primary" variant="outlined" size="small" />
                </TableCell>
                <TableCell component="th" scope="row">
                  {partner.name}
                </TableCell>
                <TableCell>{partner.email}</TableCell>
                <TableCell>{partner.phone}</TableCell>
                <TableCell>{partner.location}</TableCell>
                <TableCell align="right">
                  <IconButton color="info" onClick={() => router.push(`/admin/partners/${partner.partnerCode}/staff?name=${encodeURIComponent(partner.name)}`)} title="Manage Staff">
                    <BadgeIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleOpen(partner)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(partner.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">Account Credentials</Typography>
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
                  disabled={!!editingPartner}
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
              <Typography variant="subtitle2" color="primary">Partner Details</Typography>
              <TextField
                name="name"
                label="Partner Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                name="contactPerson"
                label="Contact Person"
                fullWidth
                required
                value={formData.contactPerson}
                onChange={handleChange}
              />
              <TextField
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
              />
              <TextField
                name="location"
                label="Location"
                fullWidth
                required
                value={formData.location}
                onChange={handleChange}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingPartner ? 'Save Changes' : 'Add Partner'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
