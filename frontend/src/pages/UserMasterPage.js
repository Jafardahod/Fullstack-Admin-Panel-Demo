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
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, CheckCircle, Block } from "@mui/icons-material";
import { userApi } from "../api/userApi";
import { Country, State, City } from "country-state-city";
import { validateUserForm } from "../utils/validation";
import { useSearch } from "../context/SearchContext";

const parseMobileString = (mobileStr, defaultCode = "+91") => {
  if (!mobileStr) return { countryCode: defaultCode, mobile: "" };

  const m = String(mobileStr).trim();

  // 1) Try common: +<digits> separator? rest
  let match = m.match(/^(\+\d{1,2})(?:[ \-\u00A0])?(.*)$/);
  if (match) {
    const code = match[1];
    // remove anything but digits from remaining part
    const rest = (match[2] || "").replace(/\D/g, "");
    return { countryCode: code, mobile: rest };
  }

  // 2) If no separator but starts with + and digits (e.g. +911234567890)
  match = m.match(/^(\+\d{1,4})(\d{4,})$/);
  if (match) {
    return { countryCode: match[1], mobile: match[2] };
  }

  // 3) last resort: no country code found — strip non-digit and return default code
  const digits = m.replace(/\D/g, "");
  return { countryCode: defaultCode, mobile: digits };
};
const thumbnail = "/mnt/data/a04fb529-dace-41cc-9324-c196588840b9.png";

const emptyForm = {
  userId: "",
  username: "",
  fullName: "",
  email: "",
  countryCode: "+91",
  mobile: "",
  country: "",
  state: "",
  city: "",
  address: "",
  pincode: "",
  password: "",
  userType: "Admin User",
};

const mapRoleToUserType = (role) => {
  if (!role) return "Normal User";
  if (role.toLowerCase() === "admin") return "Admin User";
  return "Normal User";
};

const UserMasterPage = () => {
  const { q } = useSearch();

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
    // parse mobile and country code robustly
    const { countryCode, mobile } = parseMobileString(user.mobile, "+91");

    setForm({
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      countryCode: countryCode, // parsed
      mobile: mobile, // parsed digits only
      country: user.country || "",
      state: user.state || "",
      city: user.city || "",
      address: user.address || "",
      pincode: user.pincode || "",
      password: "",
      userType: mapRoleToUserType(user.role),
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

  // Deactivate (soft delete)
  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    try {
      await userApi.deactivate(id); // calls DELETE /api/users/:id which now sets is_active = 0
      await loadUsers(q || "");
    } catch (err) {
      console.error("Deactivate failed", err);
      alert("Failed to deactivate user");
    }
  };

  // Activate
  const handleActivate = async (id) => {
    if (!window.confirm("Activate this user?")) return;
    try {
      await userApi.activate(id); // calls PATCH /api/users/:id/activate
      await loadUsers(q || "");
    } catch (err) {
      console.error("Activate failed", err);
      alert("Failed to activate user");
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
    const mobileDigits = (form.mobile || "").toString().replace(/\D/g, "");

    const payload = {
      userId: form.userId.trim(),
      username: form.username.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      mobile: `${form.countryCode}${mobileDigits}`,
      country: form.country || null,
      state: form.state || null,
      city: form.city || null,
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      ...(editingId ? {} : { password: form.password }),
      user_type: form.userType,
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
              <Box sx={{ flex: 1, mx: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>{u.full_name}</Typography>
                  <Chip
                    size="small"
                    label={u.role ? u.role.toUpperCase() : "USER"}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={u.is_active ? "Active" : "Inactive"}
                    color={u.is_active ? "success" : "default"}
                  />
                </Stack>
                <Typography variant="body2">{u.email}</Typography>
                <Typography variant="caption">
                  {u.city || u.state
                    ? `${u.city || ""}${u.city && u.state ? ", " : ""}${
                        u.state || ""
                      }`
                    : ""}
                </Typography>
              </Box>
              {u.role.toLowerCase() !== "admin" ? (
                <Box>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEdit(u)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>

                  {u.is_active ? (
                    <Tooltip title="Deactivate">
                      <IconButton onClick={() => handleDeactivate(u.id)}>
                        <Block />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activate">
                      <IconButton onClick={() => handleActivate(u.id)}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ) : (
                <Box>
                  <Tooltip title="Edit">
                    <IconButton>
                      <Edit color="disabled"/>
                    </IconButton>
                  </Tooltip>

                  {u.is_active ? (
                    <Tooltip title="Deactivate">
                      <IconButton >
                        <Block color="disabled"/>
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activate">
                      <IconButton onClick={() => handleActivate(u.id)}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
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
              <FormControl fullWidth>
                <InputLabel id="user-type-label">User Type</InputLabel>
                <Select
                  labelId="user-type-label"
                  label="User Type"
                  name="userType"
                  value={form.userType}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, userType: e.target.value }))
                  }
                >
                  <MenuItem value="Admin User">Admin User</MenuItem>
                  <MenuItem value="Normal User">Normal User</MenuItem>
                </Select>
              </FormControl>
            </Grid>

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
