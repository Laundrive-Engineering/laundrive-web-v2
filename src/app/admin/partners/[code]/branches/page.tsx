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
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
}

export default function PartnerBranchesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const partnerCode = params.code as string;
  const partnerName = searchParams.get('name') || 'Partner';

  const [branches, setBranches] = React.useState<Branch[]>([
    { id: 'BR-001', name: 'Main Office', address: 'IT Park, Cebu City', phone: '09123456789', operatingHours: '8:00 AM - 5:00 PM' },
  ]);
  const [open, setOpen] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    phone: '',
    operatingHours: '',
  });

  const handleOpen = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        operatingHours: branch.operatingHours,
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '', operatingHours: '' });
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
    if (editingBranch) {
      setBranches(branches.map(b => b.id === editingBranch.id ? { ...editingBranch, ...formData } : b));
    } else {
      const newBranch = {
        id: `BR-00${branches.length + 1}`,
        ...formData,
      };
      setBranches([...branches, newBranch]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} underline="hover" color="inherit" href="/admin/partners">
          Partners
        </MuiLink>
        <Typography color="text.primary">{partnerName} Branches</Typography>
      </Breadcrumbs>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">{partnerName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Branch Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Branch
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="branches table">
          <TableHead>
            <TableRow>
              <TableCell>Branch ID</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Operating Hours</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{branch.id}</TableCell>
                <TableCell component="th" scope="row">
                  {branch.name}
                </TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{branch.phone}</TableCell>
                <TableCell>{branch.operatingHours}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(branch)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(branch.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                name="name"
                label="Branch Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                name="address"
                label="Full Address"
                fullWidth
                multiline
                rows={2}
                required
                value={formData.address}
                onChange={handleChange}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  name="phone"
                  label="Contact Number"
                  fullWidth
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  name="operatingHours"
                  label="Operating Hours"
                  fullWidth
                  required
                  value={formData.operatingHours}
                  onChange={handleChange}
                  placeholder="e.g., 8:00 AM - 5:00 PM"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBranch ? 'Save Changes' : 'Add Branch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
