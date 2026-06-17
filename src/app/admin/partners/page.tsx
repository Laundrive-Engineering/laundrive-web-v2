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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { generatePartnerCode } from '@/utils/generators';

interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

const initialPartners: Partner[] = [
  { id: 1, partnerCode: 'QC-001', name: 'Quick Clean', email: 'contact@quickclean.com', phone: '09123456789', location: 'Cebu City' },
  { id: 2, partnerCode: 'LD-002', name: 'Laundry Day', email: 'info@laundryday.ph', phone: '09987654321', location: 'Mandaue City' },
];

export default function PartnersPage() {
  const [partners, setPartners] = React.useState<Partner[]>(initialPartners);
  const [open, setOpen] = React.useState(false);
  const [editingPartner, setEditingPartner] = React.useState<Partner | null>(null);
  const [formData, setFormData] = React.useState({
    partnerCode: '',
    name: '',
    email: '',
    phone: '',
    location: '',
  });

  const handleOpen = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        partnerCode: partner.partnerCode,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        location: partner.location,
      });
    } else {
      setEditingPartner(null);
      setFormData({ partnerCode: '', name: '', email: '', phone: '', location: '' });
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
    } else {
      const newPartner = {
        id: partners.length + 1,
        ...formData,
        partnerCode: formData.partnerCode || generatePartnerCode(formData.name),
      };
      setPartners([...partners, newPartner]);
    }
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
              <TextField
                name="partnerCode"
                label="Partner Code"
                fullWidth
                value={formData.partnerCode}
                onChange={handleChange}
                disabled={!!editingPartner}
                placeholder="Leave blank to auto-generate"
                helperText={editingPartner ? "Partner code cannot be changed" : "Unique identifier for the partner (auto-generated if blank)"}
              />
              <TextField
                name="name"
                label="Partner Name"
                fullWidth
                required
                value={formData.name}
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
    </Box>
  );
}
