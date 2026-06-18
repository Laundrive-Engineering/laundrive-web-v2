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
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { generateStaffId, generateSecurePassword } from '@/utils/generators';

interface StaffAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function PartnerStaffPage() {
  const [staff, setStaff] = React.useState<StaffAccount[]>([
    { id: 'STF-QC-001-123', name: 'John Doe', email: 'john@example.com', phone: '0911111111', role: 'Washer', createdAt: '2024-06-17' },
  ]);
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(true);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    password: '',
  });

  // In a real app, this would come from auth context
  const partnerCode = 'QC-001'; 

  const handleOpen = () => {
    setFormData({ name: '', email: '', phone: '', role: 'Staff', password: generateSecurePassword() });
    setShowPassword(true);
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
    const newStaff = {
      id: generateStaffId(partnerCode),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStaff([...staff, newStaff]);
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this staff account?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Staff Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Generate Staff Account
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="staff table">
          <TableHead>
            <TableRow>
              <TableCell>Staff ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Chip label={s.id} color="primary" variant="outlined" size="small" />
                </TableCell>
                <TableCell component="th" scope="row">
                  {s.name}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{s.email}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.phone}</Typography>
                </TableCell>
                <TableCell>{s.role}</TableCell>
                <TableCell>{s.createdAt}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDelete(s.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Staff Account</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Register a new staff member with full details and generate their login credentials.
              </Typography>
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
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Washer">Washer</MenuItem>
                  <MenuItem value="Delivery">Delivery</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="password"
                label="Initial Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                slotProps={{
                  input: {
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
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Generate Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
