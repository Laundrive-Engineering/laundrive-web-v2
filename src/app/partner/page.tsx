'use client';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function PartnerDashboard() {
  const [stats, setStats] = React.useState<{ pendingCount: number; completedTodayCount: number } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const partnerCode = localStorage.getItem('partner-code');
    if (!partnerCode) {
      setLoading(false);
      return;
    }

    fetch(`/api/partner/stats?partnerCode=${partnerCode}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Partner Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Pending Orders</Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4">{stats ? stats.pendingCount : 0}</Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Completed Today</Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4">{stats ? stats.completedTodayCount : 0}</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
