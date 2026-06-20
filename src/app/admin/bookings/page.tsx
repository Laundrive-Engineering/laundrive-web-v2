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
  Stack,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Booking {
  id: string;
  customerName: string;
  partnerName: string;
  riderName: string;
  service: string;
  status: 'Pending' | 'Picked Up' | 'In Laundry' | 'Delivering' | 'Completed';
  amount: string;
}

const mockBookings: Booking[] = [
  { id: 'BKG-001', customerName: 'Alice Green', partnerName: 'Quick Clean', riderName: 'Mike Johnson', service: 'Wash & Fold', status: 'In Laundry', amount: '₱350.00' },
  { id: 'BKG-002', customerName: 'Bob White', partnerName: 'Laundry Day', riderName: 'Pending', service: 'Dry Cleaning', status: 'Pending', amount: '₱600.00' },
  { id: 'BKG-003', customerName: 'Charlie Brown', partnerName: 'Quick Clean', riderName: 'Sarah Connor', service: 'Ironing', status: 'Completed', amount: '₱200.00' },
];

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'Pending': return 'default';
    case 'Picked Up': return 'info';
    case 'In Laundry': return 'warning';
    case 'Delivering': return 'secondary';
    case 'Completed': return 'success';
    default: return 'default';
  }
};

export default function BookingsPage() {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Booking Monitor</Typography>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="bookings table">
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Rider</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{booking.id}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>{booking.partnerName}</TableCell>
                <TableCell>{booking.riderName}</TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>{booking.amount}</TableCell>
                <TableCell>
                  <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" title="View Details">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
