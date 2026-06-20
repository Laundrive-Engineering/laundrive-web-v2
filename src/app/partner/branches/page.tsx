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
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Chip,
  Divider,
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

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
  offeredServices: string[];
}

interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  services?: Service[];
  branches?: Branch[];
}

export default function BranchesPage() {
  const [partner, setPartner] = React.useState<Partner | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null);
  
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    phone: '',
    operatingHours: '',
  });

  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);

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
      showSnackbar('Failed to load branches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (branch?: Branch) => {
    const allServices = partner?.services || [];
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        operatingHours: branch.operatingHours,
      });
      setSelectedServices(branch.offeredServices || []);
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '', operatingHours: '8:00 AM - 5:00 PM' });
      // Default to offering all services when creating a new branch
      setSelectedServices(allServices.map(s => s.id));
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;

    const currentBranches = partner.branches || [];
    let updatedBranches: Branch[] = [];

    if (editingBranch) {
      updatedBranches = currentBranches.map((b) =>
        b.id === editingBranch.id
          ? {
              ...editingBranch,
              name: formData.name,
              address: formData.address,
              phone: formData.phone,
              operatingHours: formData.operatingHours,
              offeredServices: selectedServices,
            }
          : b
      );
    } else {
      const maxId = currentBranches.reduce((max, b) => {
        const num = parseInt(b.id.replace('BR-', ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const newBranch: Branch = {
        id: `BR-${String(maxId + 1).padStart(3, '0')}`,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        operatingHours: formData.operatingHours,
        offeredServices: selectedServices,
      };
      updatedBranches = [...currentBranches, newBranch];
    }

    await saveBranches(updatedBranches);
    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (!partner) return;
    if (!confirm('Are you sure you want to delete this branch?')) return;

    const currentBranches = partner.branches || [];
    const updatedBranches = currentBranches.filter((b) => b.id !== id);

    await saveBranches(updatedBranches);
  };

  const saveBranches = async (updatedBranches: Branch[]) => {
    if (!partner) return;

    try {
      const res = await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partner.id,
          branches: updatedBranches,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSnackbar('Branches updated successfully!', 'success');
        setPartner({ ...partner, branches: updatedBranches });
      } else {
        showSnackbar(json.error || 'Failed to save branch changes', 'error');
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

  const branches = partner?.branches || [];
  const services = partner?.services || [];

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Branches Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your physical laundry branches and specify what services they offer
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
          Add Branch
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="branches table">
          <TableHead>
            <TableRow>
              <TableCell>Branch ID</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Operating Hours</TableCell>
              <TableCell>Offered Services</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No branches configured yet. Click "Add Branch" to register one.
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{branch.id}</TableCell>
                  <TableCell component="th" scope="row">
                    {branch.name}
                  </TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>{branch.phone}</TableCell>
                  <TableCell>{branch.operatingHours}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
                      {branch.offeredServices && branch.offeredServices.length > 0 ? (
                        branch.offeredServices.map(srvId => {
                          const srv = services.find(s => s.id === srvId);
                          return srv ? (
                            <Chip key={srvId} label={srv.name} size="small" color="primary" variant="outlined" />
                          ) : null;
                        })
                      ) : (
                        <Chip label="No Services Offered" size="small" color="warning" variant="filled" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(branch)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(branch.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                name="name"
                label="Branch Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Downtown Branch"
              />
              <TextField
                name="address"
                label="Full Address"
                fullWidth
                required
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., Street Name, City"
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

              <Divider sx={{ my: 1 }} />
              
              <Box>
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Offered Services
                </FormLabel>
                {services.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Please configure services first in the Services tab before toggling them here.
                  </Typography>
                ) : (
                  <FormGroup>
                    <Grid container spacing={1}>
                      {services.map((service) => (
                        <Grid item xs={12} sm={6} key={service.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedServices.includes(service.id)}
                                onChange={() => handleServiceToggle(service.id)}
                                color="primary"
                              />
                            }
                            label={`${service.name} (₱${service.price.toFixed(2)})`}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>
              {editingBranch ? 'Save Changes' : 'Add Branch'}
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
