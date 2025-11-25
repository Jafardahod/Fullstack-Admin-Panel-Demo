// frontend/src/pages/ItemMasterPage.js
import { useEffect, useState } from "react";
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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { itemApi } from "../api/itemApi";
import { validateItemForm } from "../utils/validation";

const emptyItem = { itemName: "", itemPrice: "", itemType: "" };

const ItemMasterPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const loadItems = async () => {
    const list = await itemApi.getAll();
    setItems(list);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openCreate = () => {
    setForm(emptyItem);
    setErrors({});
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      itemName: item.item_name,
      itemPrice: item.item_price,
      itemType: item.item_type,
    });
    setErrors({});
    setEditingId(item.id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const validationErrors = validateItemForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (editingId) await itemApi.update(editingId, form);
    else await itemApi.create(form);

    await loadItems();
    setOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete item?")) {
      await itemApi.remove(id);
      await loadItems();
    }
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
              <Box>
                <Typography fontWeight="600">{i.item_name}</Typography>
                <Typography variant="body2">
                  ₹{i.item_price} — {i.item_type}
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
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            name="itemName"
            label="Item Name"
            value={form.itemName}
            onChange={handleChange}
            error={!!errors.itemName}
            helperText={errors.itemName}
          />
          <TextField
            fullWidth
            margin="dense"
            name="itemPrice"
            label="Item Price"
            type="number"
            value={form.itemPrice}
            onChange={handleChange}
            error={!!errors.itemPrice}
            helperText={errors.itemPrice}
          />
          <TextField
            fullWidth
            margin="dense"
            name="itemType"
            label="Item Type"
            value={form.itemType}
            onChange={handleChange}
            error={!!errors.itemType}
            helperText={errors.itemType}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemMasterPage;
