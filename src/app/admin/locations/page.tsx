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
  Switch,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';

interface OperationLocation {
  id: string;
  name: string;
  active: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = React.useState<OperationLocation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Snackbar feedback state
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/locations');
      const json = await res.json();
      if (json.success) {
        setLocations(json.data);
      } else {
        showFeedback(json.error || 'Failed to fetch locations', 'error');
      }
    } catch (err) {
      showFeedback('An error occurred while fetching locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLocations();
  }, []);

  const showFeedback = (msg: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleOpen = () => {
    setNewName('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setLocations([...locations, json.data]);
        showFeedback(`Location "${newName.trim()}" added successfully`);
        handleClose();
      } else {
        showFeedback(json.error || 'Failed to add location', 'error');
      }
    } catch (err) {
      showFeedback('An error occurred while adding location', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const updatedActive = !currentActive;
    try {
      // Optimistic UI update
      setLocations(locations.map(loc => loc.id === id ? { ...loc, active: updatedActive } : loc));

      const res = await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: updatedActive }),
      });
      const json = await res.json();
      if (!json.success) {
        // Rollback
        setLocations(locations.map(loc => loc.id === id ? { ...loc, active: currentActive } : loc));
        showFeedback(json.error || 'Failed to update location status', 'error');
      } else {
        showFeedback(`Location status updated to ${updatedActive ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      // Rollback
      setLocations(locations.map(loc => loc.id === id ? { ...loc, active: currentActive } : loc));
      showFeedback('An error occurred while updating status', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the operation location "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setLocations(locations.filter(loc => loc.id !== id));
        showFeedback(`Location "${name}" deleted successfully`);
      } else {
        showFeedback(json.error || 'Failed to delete location', 'error');
      }
    } catch (err) {
      showFeedback('An error occurred while deleting location', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BusinessIcon fontSize="large" />
            Operation Locations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage administrative zones where Laundrive is currently operating
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ px: 3, py: 1, borderRadius: 2 }}>
          Add Location
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="locations table">
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Location ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', pr: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No operation locations found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((loc) => (
                  <TableRow key={loc.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Chip label={loc.id} color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '1.05rem' }}>{loc.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Switch
                          checked={loc.active}
                          onChange={() => handleToggleActive(loc.id, loc.active)}
                          color="primary"
                        />
                        <Chip
                          label={loc.active ? 'Active' : 'Inactive'}
                          color={loc.active ? 'success' : 'default'}
                          size="small"
                          sx={{ minWidth: 70 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <IconButton color="error" onClick={() => handleDelete(loc.id, loc.name)} title="Delete Location">
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

      {/* Add New Location Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Add New Location</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the name of the new city/zone where service operations will be active.
            </Typography>
            <TextField
              autoFocus
              name="name"
              label="Location Name"
              placeholder="e.g. Lapu-Lapu City"
              fullWidth
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={submitting}
              sx={{ mb: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting || !newName.trim()}>
              {submitting ? 'Adding...' : 'Add Location'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
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
