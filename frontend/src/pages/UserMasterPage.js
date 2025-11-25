// frontend/src/pages/UserMasterPage.js
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
  MenuItem,
  Paper,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { userApi } from "../api/userApi";
import { Country, State, City } from "country-state-city";
import { validateUserForm } from "../utils/validation";

const emptyForm = {
  userId: "",
  username: "",
  fullName: "",
  email: "",
  countryCode: "+91",
  mobile: "",
  country: "", // ISO2, e.g. "IN"
  state: "",   // state ISO, e.g. "MH"
  city: "",    // city name
  address: "",
  pincode: "",
  password: "",
};

const UserMasterPage = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);

  const loadUsers = async () => {
    const list = await userApi.getAll();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // load country data once
  useEffect(() => {
    const cList = Country.getAllCountries();
    setCountries(cList);

    const codes = cList
      .filter((c) => !!c.phonecode)
      .map((c) => ({
        value: `+${c.phonecode}`,
        label: `${c.name} (+${c.phonecode})`,
      }))
      // remove duplicates by value
      .filter(
        (item, index, arr) =>
          arr.findIndex((x) => x.value === item.value) === index
      );
    setCountryCodes(codes);
  }, []);

  const handleCountryChange = (isoCode) => {
    const countryStates = State.getStatesOfCountry(isoCode);
    setStates(countryStates);
    setCities([]);
    setForm((prev) => ({ ...prev, country: isoCode, state: "", city: "" }));
    setErrors((prev) => ({ ...prev, country: "", state: "", city: "" }));
  };

  const handleStateChange = (stateIso) => {
    const cityList = City.getCitiesOfState(form.country, stateIso);
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
    // here we only have stored text values in DB,
    // so we just prefill the text fields; dropdowns can stay empty if iso codes not stored.
    setForm((prev) => ({
      ...prev,
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      countryCode: "+91", // or parse from user.mobile if you stored it
      mobile: (user.mobile || "").replace(/^\+\d+\s?/, ""),
      country: "", // cannot recover ISO from DB text; user can re-select if needed
      state: "",
      city: user.city || "",
      address: user.address || "",
      pincode: user.pincode || "",
      password: "",
    }));
    setStates([]);
    setCities([]);
    setErrors({});
    setEditingId(user.id);
    setOpen(true);
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
      country: form.country, // ISO2 like "IN"
      state: form.state,     // ISO like "MH"
      city: form.city,
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      ...(editingId ? {} : { password: form.password }),
    };

    if (editingId) {
      await userApi.update(editingId, payload);
    } else {
      await userApi.create(payload);
    }

    await loadUsers();
    setOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      await userApi.remove(id);
      await loadUsers();
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
        {users.map((user) => (
          <Grid item xs={12} md={6} key={user.id}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight="600">{user.full_name}</Typography>
                <Typography variant="body2">{user.email}</Typography>
                <Typography variant="caption">
                  {user.city}, {user.state}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => openEdit(user)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(user.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            {/* IDs / name */}
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

            {/* email */}
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

            {/* mobile + code */}
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

            {/* Country */}
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

            {/* State */}
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

            {/* City */}
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

            {/* Address + Pincode */}
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

            {/* Password – only on create */}
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
    </Box>
  );
};

export default UserMasterPage;
