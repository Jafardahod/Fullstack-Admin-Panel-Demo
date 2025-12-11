// frontend/src/pages/ItemMasterPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { itemApi } from "../api/itemApi";
import { validateItemForm } from "../utils/validation";
import { useSearch } from "../context/SearchContext";

const thumbnail = "/mnt/data/a04fb529-dace-41cc-9324-c196588840b9.png";

const emptyItem = {
  itemName: "",
  itemPrice: "",
  itemType: "",
};

const ItemMasterPage = () => {
  const { q } = useSearch(); // global search

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const loadItems = async (searchTerm = "") => {
    try {
      const list = await itemApi.getAll(searchTerm);
      setItems(list);
    } catch (err) {
      console.error("Failed to load items", err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    loadItems(q || "");
  }, [q]);

  const openCreate = () => {
    setForm(emptyItem);
    setEditingId(null);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      itemName: item.item_name,
      itemPrice: item.item_price,
      itemType: item.item_type,
    });
    setEditingId(item.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await itemApi.remove(id);
      await loadItems(q || "");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete item");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateItemForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingId) {
        await itemApi.update(editingId, form);
      } else {
        await itemApi.create(form);
      }

      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);

      await loadItems(q || "");
      setOpen(false);
    } catch (err) {
      console.error("Save failed", err);
      const resp = err?.response?.data;

      if (resp?.error === "DUPLICATE" && Array.isArray(resp.fields)) {
        const map = {};
        resp.fields.forEach((f) => {
          if (f === "item_name") map.itemName = "Item name already exists";
        });
        setErrors((prev) => ({ ...prev, ...map }));
        return;
      }

      const msg = resp?.message || "Failed to save item";
      alert(msg);
    }
    const expiryTime = Date.now() + 1000 * 60 * 60;
    localStorage.setItem("expiry", expiryTime);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Item Master
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          + Add Item
        </Button>
      </Box>

      <Grid container spacing={2}>
        {items.map((i) => (
          <Grid item xs={12} md={6} key={i.id}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  bgcolor: "grey.100",
                }}
                src={thumbnail}
                alt={i.item_name}
              >
                <Inventory2Icon />
              </Avatar>

              <Box sx={{ flex: 1, ml: 2 }}>
                <Typography fontWeight={600}>{i.item_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {i.item_type}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                  ₹{Number(i.item_price).toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <IconButton onClick={() => openEdit(i)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(i.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
        {items.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">No items found.</Typography>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Item Name"
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            error={!!errors.itemName}
            helperText={errors.itemName}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Item Price"
            name="itemPrice"
            type="number"
            value={form.itemPrice}
            onChange={handleChange}
            error={!!errors.itemPrice}
            helperText={errors.itemPrice}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Item Type"
            name="itemType"
            value={form.itemType}
            onChange={handleChange}
            error={!!errors.itemType}
            helperText={errors.itemType}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Item saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemMasterPage;
