import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

export default function PartnerDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Partner Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6">Pending Orders</Typography>
            <Typography variant="h4">12</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6">Completed Today</Typography>
            <Typography variant="h4">45</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
