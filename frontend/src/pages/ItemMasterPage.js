// frontend/src/pages/ItemMasterPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { itemApi } from "../api/itemApi";
import { validateItemForm } from "../utils/validation";

const thumbnail = "/mnt/data/a04fb529-dace-41cc-9324-c196588840b9.png";

const ItemCard = ({ item, onEdit, onDelete }) => (
  <Card sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Avatar variant="rounded" src={thumbnail} sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: "black", margin: 1 }}>
      <Inventory2Icon />
    </Avatar>
    <CardContent sx={{ flex: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.item_name}</Typography>
      <Typography variant="body2" color="text.secondary">{item.item_type}</Typography>
      <Typography variant="subtitle2" sx={{ mt: 0.5 }}>₹{Number(item.item_price).toFixed(2)}</Typography>
    </CardContent>
    <CardActions sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <IconButton onClick={() => onEdit(item)}><EditIcon /></IconButton>
      <IconButton onClick={() => onDelete(item.id)}><DeleteIcon /></IconButton>
    </CardActions>
  </Card>
);

const emptyItem = { itemName: "", itemPrice: "", itemType: "" };

const ItemMasterPage = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const loadItems = async () => {
    try {
      const list = await itemApi.getAll();
      setItems(list);
    } catch (err) {
      console.error("Failed to load items", err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openCreate = () => {
    setForm(emptyItem);
    setEditingId(null);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (i) => {
    setForm({ itemName: i.item_name, itemPrice: i.item_price, itemType: i.item_type });
    setEditingId(i.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await itemApi.remove(id);
    await loadItems();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateItemForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingId) await itemApi.update(editingId, form);
      else await itemApi.create(form);

      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
      setOpen(false);
      await loadItems();
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.error === "DUPLICATE" && Array.isArray(resp.fields)) {
        const map = {};
        resp.fields.forEach(f => {
          if (f === "item_name") map.itemName = "Item name already exists";
        });
        setErrors(prev => ({ ...prev, ...map }));
      } else {
        alert(resp?.message || "Failed to save item");
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={800}>Item Master</Typography>
        <Button variant="contained" onClick={openCreate}>+ Add Item</Button>
      </Box>

      <Grid container spacing={2}>
        {items.map(i => (
          <Grid key={i.id} item xs={12} sm={6} md={4}>
            <ItemCard item={i} onEdit={openEdit} onDelete={handleDelete} />
          </Grid>
        ))}
        {items.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography color="text.secondary">No items found.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" name="itemName" label="Item Name" value={form.itemName} onChange={handleChange} error={!!errors.itemName} helperText={errors.itemName} />
          <TextField fullWidth margin="dense" name="itemPrice" label="Item Price" type="number" value={form.itemPrice} onChange={handleChange} error={!!errors.itemPrice} helperText={errors.itemPrice} />
          <TextField fullWidth margin="dense" name="itemType" label="Item Type" value={form.itemType} onChange={handleChange} error={!!errors.itemType} helperText={errors.itemType} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={successOpen} autoHideDuration={2000} onClose={() => setSuccessOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success">Item saved successfully!</Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemMasterPage;
