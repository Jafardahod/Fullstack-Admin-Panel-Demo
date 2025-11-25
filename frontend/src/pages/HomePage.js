// frontend/src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Avatar,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { userApi } from "../api/userApi";
import { itemApi } from "../api/itemApi";

/**
 * Shows two sections:
 * - Users (cards) — admin only
 * - Items (cards) — visible to everyone logged in
 *
 * Uses a thumbnail placeholder for now (uploaded by user).
 */
const thumbnail = "/mnt/data/a04fb529-dace-41cc-9324-c196588840b9.png";

const UserCard = ({ u }) => {
  return (
    <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 1 }}>
      <Avatar
        variant="rounded"
        sx={{ width: 72, height: 72, borderRadius: 10 }}
        src={thumbnail}
        alt={u.full_name}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {u.full_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          @{u.username} · {u.email}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {u.city || "—"} {u.state ? `, ${u.state}` : ""}
        </Typography>
      </Box>
    </Card>
  );
};

const ItemCard = ({ i }) => {
  return (
    <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 1 }}>
      <Avatar
        variant="rounded"
        sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: "grey.100" }}
        src={thumbnail}
        alt={i.item_name}
      >
        <Inventory2Icon />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {i.item_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {i.item_type}
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
          ₹{Number(i.item_price).toFixed(2)}
        </Typography>
      </Box>
    </Card>
  );
};

const HomePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { q } = useSearch(); // <-- global search term

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchTerm = "") => {
    setLoading(true);
    try {
      const [usersData, itemsData] = await Promise.all([
        isAdmin ? userApi.getAll(searchTerm) : Promise.resolve([]),
        itemApi.getAll(searchTerm),
      ]);

      setUsers(usersData || []);
      setItems(itemsData || []);
    } catch (err) {
      console.error("Home fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(q);
  }, [q, isAdmin]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {isAdmin && (
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Users
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {users.length} total
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Typography color="text.secondary">Searching...</Typography>
            ) : (
              <Grid container spacing={2}>
                {users.map((u) => (
                  <Grid key={u.id} item xs={12}>
                    <UserCard u={u} />
                  </Grid>
                ))}
                {users.length === 0 && (
                  <Grid item xs={12}>
                    <Typography color="text.secondary">No users yet.</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        )}

        <Grid item xs={12} md={isAdmin ? 6 : 12}>
          <Box
            sx={{
              mb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Items
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {items.length} available
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Typography color="text.secondary">Searching...</Typography>
          ) : (
            <Grid container spacing={2}>
              {items.map((i) => (
                <Grid key={i.id} item xs={12} sm={6} md={12}>
                  <ItemCard i={i} />
                </Grid>
              ))}
              {items.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No items yet.</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
