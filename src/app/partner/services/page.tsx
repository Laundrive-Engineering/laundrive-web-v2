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
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  services?: Service[];
  branches?: any[];
}

export default function ServicesPage() {
  const [partner, setPartner] = React.useState<Partner | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    price: '',
    unit: 'per kg',
  });

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  React.useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
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
        }
      }
    } catch (error) {
      showSnackbar('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        unit: service.unit,
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', price: '', unit: 'per kg' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      showSnackbar('Invalid price value', 'error');
      return;
    }

    const currentServices = partner.services || [];
    let updatedServices: Service[] = [];

    if (editingService) {
      updatedServices = currentServices.map((s) =>
        s.id === editingService.id
          ? { ...editingService, name: formData.name, price: priceNum, unit: formData.unit }
          : s
      );
    } else {
      // Find max numeric ID or use timestamp
      const maxId = currentServices.reduce((max, s) => {
        const num = parseInt(s.id.replace('SRV-', ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const newService = {
        id: `SRV-${String(maxId + 1).padStart(3, '0')}`,
        name: formData.name,
        price: priceNum,
        unit: formData.unit,
      };
      updatedServices = [...currentServices, newService];
    }

    await saveServices(updatedServices);
    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (!partner) return;
    if (!confirm('Are you sure you want to delete this service? It will also be removed from any branches offering it.')) return;

    const currentServices = partner.services || [];
    const updatedServices = currentServices.filter((s) => s.id !== id);

    // Clean up branches offeredServices as well
    const currentBranches = partner.branches || [];
    const updatedBranches = currentBranches.map((b) => ({
      ...b,
      offeredServices: (b.offeredServices || []).filter((srvId: string) => srvId !== id),
    }));

    await saveServices(updatedServices, updatedBranches);
  };

  const saveServices = async (updatedServices: Service[], updatedBranches?: any[]) => {
    if (!partner) return;

    try {
      const payload: any = {
        id: partner.id,
        services: updatedServices,
      };
      if (updatedBranches) {
        payload.branches = updatedBranches;
      }

      const res = await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSnackbar('Services updated successfully!', 'success');
        setPartner({
          ...partner,
          services: updatedServices,
          ...(updatedBranches ? { branches: updatedBranches } : {}),
        });
      } else {
        showSnackbar(json.error || 'Failed to save changes', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred while saving', 'error');
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

  const services = partner?.services || [];

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Services & Pricing
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your laundry services and prices
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
          Add Service
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="services table">
          <TableHead>
            <TableRow>
              <TableCell>Service ID</TableCell>
              <TableCell>Service Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No services configured yet. Click "Add Service" to create one.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{service.id}</TableCell>
                  <TableCell component="th" scope="row">
                    {service.name}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ₱{service.price.toFixed(2)}
                  </TableCell>
                  <TableCell>{service.unit}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(service)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(service.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                name="name"
                label="Service Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Wash, Dry & Fold"
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  name="price"
                  label="Price (₱)"
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="150.00"
                />
                <TextField
                  name="unit"
                  label="Pricing Unit"
                  fullWidth
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., per kg"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>
              {editingService ? 'Save Changes' : 'Add Service'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
