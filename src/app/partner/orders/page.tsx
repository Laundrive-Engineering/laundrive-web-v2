'use client';
import * as React from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  partnerCode: string;
  branchName?: string;
  service: string;
  status: 'Pending' | 'Picked Up' | 'In Laundry' | 'Delivering' | 'Completed';
  total: number;
  bookingDate: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Picked Up':
      return 'info';
    case 'In Laundry':
      return 'secondary';
    case 'Delivering':
      return 'primary';
    case 'Completed':
      return 'success';
    default:
      return 'default';
  }
};

const STATUSES = [
  { label: 'Mark Pending', value: 'Pending' },
  { label: 'Mark Picked Up', value: 'Picked Up' },
  { label: 'Mark In Laundry', value: 'In Laundry' },
  { label: 'Mark Delivering', value: 'Delivering' },
  { label: 'Mark Completed', value: 'Completed' },
];

export default function OrdersPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);

  const fetchBookings = React.useCallback(() => {
    const partnerCode = localStorage.getItem('partner-code');
    if (!partnerCode) {
      setLoading(false);
      return;
    }

    fetch(`/api/partner/bookings?partnerCode=${partnerCode}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setBookings(json.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateClick = (event: React.MouseEvent<HTMLButtonElement>, bookingId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedBookingId(bookingId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBookingId(null);
  };

  const handleStatusSelect = (status: string) => {
    if (!selectedBookingId) return;
    setAnchorEl(null);

    fetch('/api/partner/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedBookingId, status }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          fetchBookings();
        }
      })
      .catch(() => {});
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Order Management</Typography>
        <Button variant="contained">New Order</Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{booking.id}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>
                    {booking.service}
                    {booking.branchName && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Branch: {booking.branchName}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>₱{booking.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={booking.status} color={getStatusColor(booking.status) as any} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={(e) => handleUpdateClick(e, booking.id)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {STATUSES.map((status) => (
          <MenuItem key={status.value} onClick={() => handleStatusSelect(status.value)}>
            {status.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
