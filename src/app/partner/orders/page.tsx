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
} from '@mui/material';

interface Order {
  id: string;
  customer: string;
  service: string;
  amount: string;
  status: 'pending' | 'processing' | 'ready' | 'delivered';
}

const orders: Order[] = [
  { id: 'ORD-101', customer: 'John Smith', service: 'Wash & Fold', amount: '₱250.00', status: 'pending' },
  { id: 'ORD-102', customer: 'Mary Jane', service: 'Dry Clean', amount: '₱450.00', status: 'processing' },
  { id: 'ORD-103', customer: 'Tom Brown', service: 'Ironing', amount: '₱150.00', status: 'ready' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'ready': return 'success';
    case 'delivered': return 'default';
    default: return 'default';
  }
};

export default function OrdersPage() {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Order Management</Typography>
        <Button variant="contained">New Order</Button>
      </Stack>

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
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.service}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  <Chip label={order.status} color={getStatusColor(order.status) as any} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button size="small">Update</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
