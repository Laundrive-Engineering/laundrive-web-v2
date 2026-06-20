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
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { generateSecurePassword } from '@/utils/generators';

interface Rider {
  id: number;
  riderCode: string;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  vehicle: string;
  status: 'Active' | 'Inactive';
}

const generateRiderCode = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RDR-${random}`;
};

const initialRiders: Rider[] = [
  { id: 1, riderCode: 'RDR-1024', name: 'Mike Johnson', licenseNumber: 'D01-23-456789', email: 'mike@example.com', phone: '09171234567', vehicle: 'Motorcycle', status: 'Active' },
];

export default function RidersPage() {
  const [riders, setRiders] = React.useState<Rider[]>(initialRiders);
  const [open, setOpen] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [resettingRider, setResettingRider] = React.useState<Rider | null>(null);
  const [newPassword, setNewPassword] = React.useState('');
  const [editingRider, setEditingRider] = React.useState<Rider | null>(null);
  const [showPassword, setShowPassword] = React.useState(true);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    riderCode: '',
    name: '',
    licenseNumber: '',
    email: '',
    phone: '',
    vehicle: '',
    password: '',
  });

  const handleOpen = (rider?: Rider) => {
    if (rider) {
      setEditingRider(rider);
      setFormData({
        riderCode: rider.riderCode,
        name: rider.name,
        licenseNumber: rider.licenseNumber,
        email: rider.email,
        phone: rider.phone,
        vehicle: rider.vehicle,
        password: '••••••••',
      });
      setShowPassword(false);
    } else {
      setEditingRider(null);
      setFormData({
        riderCode: generateRiderCode(),
        name: '',
        licenseNumber: '',
        email: '',
        phone: '',
        vehicle: '',
        password: generateSecurePassword(),
      });
      setShowPassword(true);
    }
    setOpen(true);
  };

  const handleResetPassword = (rider: Rider) => {
    const password = generateSecurePassword();
    setResettingRider(rider);
    setNewPassword(password);
    setShowPassword(true);
    setResetDialogOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setResetDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRider) {
      setRiders(riders.map(r => r.id === editingRider.id ? { ...editingRider, ...formData, status: editingRider.status } : r));
      setSnackbarMessage('Rider updated successfully');
    } else {
      const newRider: Rider = {
        id: riders.length + 1,
        status: 'Active',
        ...formData,
      };
      setRiders([...riders, newRider]);
      setSnackbarMessage(`Rider ${formData.riderCode} added successfully`);
    }
    setOpenSnackbar(true);
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this rider?')) {
      setRiders(riders.filter(r => r.id !== id));
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Rider Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Rider
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="riders table">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>License / Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riders.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell>
                  <Chip label={rider.riderCode} color="primary" variant="outlined" size="small" />
                </TableCell>
                <TableCell component="th" scope="row">
                  {rider.name}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{rider.email}</Typography>
                  <Typography variant="caption" color="text.secondary">{rider.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{rider.licenseNumber}</Typography>
                  <Typography variant="caption" color="text.secondary">{rider.vehicle}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={rider.status} color={rider.status === 'Active' ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="warning" onClick={() => handleResetPassword(rider)} title="Reset Password">
                    <LockResetIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleOpen(rider)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(rider.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRider ? 'Edit Rider' : 'Add New Rider'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">Account Credentials</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  name="riderCode"
                  label="Generated Username"
                  fullWidth
                  value={formData.riderCode}
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Unique login identifier"
                />
                <TextField
                  name="password"
                  label="Initial Password"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!!editingRider}
                  slotProps={{
                    input: {
                      readOnly: !!editingRider,
                      endAdornment: !editingRider && (
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
                  helperText={editingRider ? "Password cannot be viewed here" : "Secure auto-generated password"}
                />
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary">Rider Details</Typography>
              <TextField
                name="name"
                label="Full Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
              <Stack direction="row" spacing={2}>
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
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  name="licenseNumber"
                  label="Driver License Number"
                  fullWidth
                  required
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
                <TextField
                  name="vehicle"
                  label="Vehicle Type"
                  fullWidth
                  required
                  value={formData.vehicle}
                  onChange={handleChange}
                  placeholder="e.g., Motorcycle, Van"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingRider ? 'Save Changes' : 'Add Rider'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={resetDialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Rider Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A new secure password has been generated for <strong>{resettingRider?.name}</strong>.
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
            helperText="Please share this new password with the rider."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} variant="contained">Done</Button>
        </DialogActions>
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
