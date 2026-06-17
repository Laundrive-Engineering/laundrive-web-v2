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
  Breadcrumbs,
  Link as MuiLink,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { generateStaffId, generateSecurePassword } from '@/utils/generators';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface StaffAccount {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminPartnerStaffPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const partnerCode = params.code as string;
  const partnerName = searchParams.get('name') || 'Partner';

  const [staff, setStaff] = React.useState<StaffAccount[]>([
    { id: `STF-${partnerCode}-123`, name: 'Sample Staff', role: 'Staff', createdAt: '2024-06-17' },
  ]);
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(true);
  const [formData, setFormData] = React.useState({
    name: '',
    password: '',
  });

  const handleOpen = () => {
    setFormData({ name: '', password: generateSecurePassword() });
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
      role: 'Staff',
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
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} underline="hover" color="inherit" href="/admin/partners">
          Partners
        </MuiLink>
        <Typography color="text.primary">{partnerName} Staff</Typography>
      </Breadcrumbs>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">{partnerName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Staff Management for Code: {partnerCode}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Staff Account
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="staff table">
          <TableHead>
            <TableRow>
              <TableCell>Staff ID / Code</TableCell>
              <TableCell>Name</TableCell>
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

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Staff Account</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Generating staff account for <strong>{partnerName}</strong>.
              </Typography>
              <TextField
                name="name"
                label="Staff Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
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
            <Button type="submit" variant="contained">
              Generate Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
