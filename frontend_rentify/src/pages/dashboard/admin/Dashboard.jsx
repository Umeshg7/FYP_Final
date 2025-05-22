import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Card, CardContent, Grid, Typography, Box,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:6001/dashboard/stats');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const monthLabels = stats.monthlyRevenue.map(item =>
    new Date(0, item._id - 1).toLocaleString('default', { month: 'short' })
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#2d3748' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#718096' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={14} sx={{ mb: 4 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, color: '#4f46e5', icon: '👥' },
          { label: 'Active Bookings', value: stats.activeBookings, color: '#10b981', icon: '📅' },
          { label: 'Pending KYCs', value: stats.pendingKYCs, color: '#f59e0b', icon: '📝' },
          { label: 'Total Rent Items', value: stats.totalRentItems, color: '#ef4444', icon: '🛋️' }
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${card.color}`
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#718096' }}>{card.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: card.color }}>{card.icon}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Line Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Monthly Revenue</Typography>
              <Box sx={{ height: '350px', width: '700px' }}>
                <Line
                  data={{
                    labels: monthLabels,
                    datasets: [{
                      label: 'Revenue (NPR)',
                      data: stats.monthlyRevenue.map(item => item.total * 0.1), // Multiply by 0.1 to get 10%
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      borderColor: '#4f46e5',
                      borderWidth: 2,
                      tension: 0.4, 
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: context => `NPR ${(context.raw).toLocaleString()}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `NPR ${value.toLocaleString()}`
                        }
                      },
                      x: {
                        ticks: {
                          autoSkip: false
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Status Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Booking Status</Typography>
              <Box sx={{ height: '350px' }}>
                <Pie
                  data={{
                    labels: stats.bookingsAnalytics.byStatus.map(item => item._id),
                    datasets: [{
                      data: stats.bookingsAnalytics.byStatus.map(item => item.count),
                      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          padding: 16,
                          usePointStyle: true
                        }
                      },
                      datalabels: {
                        formatter: (value, ctx) => {
                          const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                          return `${Math.round((value / total) * 100)}%`;
                        },
                        color: '#fff',
                        font: { weight: 'bold' }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
