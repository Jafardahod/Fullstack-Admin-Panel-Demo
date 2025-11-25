import { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const resUsers = await axiosClient.get('/users');
          setUsers(resUsers.data);
        }
        const resItems = await axiosClient.get('/items');
        setItems(resItems.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [isAdmin]);

  return (
    <Grid container spacing={3}>
      {isAdmin && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">All Users</Typography>
            {users.map((u) => (
              <Typography key={u.id}>
                {u.full_name} ({u.username}) - {u.email}
              </Typography>
            ))}
          </Paper>
        </Grid>
      )}
      <Grid item xs={12} md={isAdmin ? 6 : 12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">All Items</Typography>
          {items.map((i) => (
            <Typography key={i.id}>
              {i.item_name} - ₹{i.item_price} ({i.item_type})
            </Typography>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomePage;
