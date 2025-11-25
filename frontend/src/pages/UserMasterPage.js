// frontend/src/pages/UserMasterPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { userApi } from "../api/userApi";
import { Country, State, City } from "country-state-city";
import { validateUserForm } from "../utils/validation";
import { useSearch } from "../context/SearchContext";

const thumbnail = "/mnt/data/a04fb529-dace-41cc-9324-c196588840b9.png";

const emptyForm = {
  userId: "",
  username: "",
  fullName: "",
  email: "",
  countryCode: "+91",
  mobile: "",
  country: "", // ISO2
  state: "", // state ISO
  city: "", // city name
  address: "",
  pincode: "",
  password: "",
};

const UserMasterPage = () => {
  const { q } = useSearch(); // <-- global search term

  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  // meta lists
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);

  const loadUsers = async (searchTerm = "") => {
    try {
      const list = await userApi.getAll(searchTerm);
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  useEffect(() => {
    // initial load + country data
    loadUsers();

    const cList = Country.getAllCountries();
    setCountries(cList || []);

    const codes = (cList || [])
      .filter((c) => !!c.phonecode)
      .map((c) => ({
        value: `+${c.phonecode}`,
        label: `${c.name} (+${c.phonecode})`,
      }))
      .filter(
        (item, index, arr) =>
          arr.findIndex((x) => x.value === item.value) === index
      );

    setCountryCodes(codes);
  }, []);

  // 🔍 React to global search changes
  useEffect(() => {
    loadUsers(q || "");
  }, [q]);

  const handleCountryChange = (isoCode) => {
    const countryStates = State.getStatesOfCountry(isoCode) || [];
    setStates(countryStates);
    setCities([]);
    setForm((prev) => ({ ...prev, country: isoCode, state: "", city: "" }));
    setErrors((prev) => ({ ...prev, country: "", state: "", city: "" }));
  };

  const handleStateChange = (stateIso) => {
    const cityList = City.getCitiesOfState(form.country, stateIso) || [];
    setCities(cityList);
    setForm((prev) => ({ ...prev, state: stateIso, city: "" }));
    setErrors((prev) => ({ ...prev, state: "", city: "" }));
  };

  const handleCityChange = (cityName) => {
    setForm((prev) => ({ ...prev, city: cityName }));
    setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setStates([]);
    setCities([]);
    setOpen(true);
  };

  const openEdit = (user) => {
    setForm({
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      countryCode:
        user.mobile && user.mobile.startsWith("+")
          ? user.mobile.replace(/^(\+\d+).*/, "$1")
          : "+91",
      mobile: user.mobile ? user.mobile.replace(/^\+\d+\s?/, "") : "",
      country: user.country || "",
      state: user.state || "",
      city: user.city || "",
      address: user.address || "",
      pincode: user.pincode || "",
      password: "",
    });

    if (user.country) {
      const s = State.getStatesOfCountry(user.country);
      setStates(s || []);
    } else {
      setStates([]);
    }
    if (user.country && user.state) {
      const c = City.getCitiesOfState(user.country, user.state);
      setCities(c || []);
    } else {
      setCities([]);
    }

    setErrors({});
    setEditingId(user.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await userApi.remove(id);
      await loadUsers(q || "");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete user");
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateUserForm({
      ...form,
      editing: !!editingId,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      userId: form.userId.trim(),
      username: form.username.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      mobile: `${form.countryCode}${form.mobile.trim()}`,
      country: form.country || null,
      state: form.state || null,
      city: form.city || null,
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      ...(editingId ? {} : { password: form.password }),
    };

    try {
      if (editingId) {
        await userApi.update(editingId, payload);
      } else {
        await userApi.create(payload);
      }

      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);

      await loadUsers(q || "");
      setOpen(false);
    } catch (err) {
      console.error("Save failed", err);
      const resp = err?.response?.data;

      if (resp?.error === "DUPLICATE" && Array.isArray(resp.fields)) {
        const fieldMap = {};
        resp.fields.forEach((f) => {
          if (f === "userId") fieldMap.userId = "User ID already exists";
          if (f === "username") fieldMap.username = "Username already exists";
          if (f === "email") fieldMap.email = "Email already exists";
          if (f === "mobile") fieldMap.mobile = "Mobile already exists";
        });
        setErrors((prev) => ({ ...prev, ...fieldMap }));
        return;
      }

      if (resp?.error === "VALIDATION") {
        alert(resp.message || "Validation failed");
        return;
      }

      const msg = resp?.message || "Failed to save user";
      alert(msg);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          User Master
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          + Add User
        </Button>
      </Box>

      <Grid container spacing={2}>
        {users.map((u) => (
          <Grid item xs={12} md={6} key={u.id}>
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
                  marginRight: 0,
                  paddingRight: 0,
                }}
                src={thumbnail}
                alt={u.full_name}
              />
              <Box>
                <Typography fontWeight={600}>{u.full_name}</Typography>
                <Typography variant="body2">{u.email}</Typography>
                <Typography variant="caption">
                  {u.city || u.state
                    ? `${u.city || ""}${u.city && u.state ? ", " : ""}${
                        u.state || ""
                      }`
                    : ""}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => openEdit(u)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(u.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
        {users.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">No users found.</Typography>
          </Grid>
        )}
      </Grid>

      {/* Dialog for create/edit */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editingId ? "Edit User" : "Create New User"}</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="User ID"
                name="userId"
                value={form.userId}
                onChange={handleBasicChange}
                disabled={!!editingId}
                error={!!errors.userId}
                helperText={errors.userId}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={form.username}
                onChange={handleBasicChange}
                disabled={!!editingId}
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleBasicChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={form.email}
                onChange={handleBasicChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="code-label">Code</InputLabel>
                <Select
                  labelId="code-label"
                  label="Code"
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleBasicChange}
                  size="small"
                >
                  {countryCodes.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={8} md={4}>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleBasicChange}
                error={!!errors.mobile}
                helperText={errors.mobile}
                inputProps={{ inputMode: "numeric" }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  label="Country"
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  error={!!errors.country}
                >
                  {countries.map((c) => (
                    <MenuItem key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && (
                  <Typography variant="caption" color="error">
                    {errors.country}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={!states.length}>
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  label="State"
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  error={!!errors.state}
                >
                  {states.map((s) => (
                    <MenuItem key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.state && (
                  <Typography variant="caption" color="error">
                    {errors.state}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={!cities.length}>
                <InputLabel id="city-label">City</InputLabel>
                <Select
                  labelId="city-label"
                  label="City"
                  value={form.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  error={!!errors.city}
                >
                  {cities.map((c) => (
                    <MenuItem key={c.name} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.city && (
                  <Typography variant="caption" color="error">
                    {errors.city}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleBasicChange}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                minRows={2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleBasicChange}
                error={!!errors.pincode}
                helperText={errors.pincode}
                inputProps={{ inputMode: "numeric" }}
              />
            </Grid>

            {!editingId && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleBasicChange}
                  error={!!errors.password}
                  helperText={
                    errors.password ||
                    "Min 8 chars, upper, lower, number & special char."
                  }
                />
              </Grid>
            )}
          </Grid>
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
          User saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserMasterPage;
