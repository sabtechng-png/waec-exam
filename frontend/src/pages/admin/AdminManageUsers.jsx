import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BlockIcon from "@mui/icons-material/Block";
import RestoreIcon from "@mui/icons-material/Restore";

import api from "../../utils/api";

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");

  const notify = (msg, severity = "info") =>
    setToast({ open: true, msg, severity });

  const load = async () => {
    setBusy(true);
    try {
      const res = await api.get("/admin/users", {
        params: { search, role, status },
      });
      setUsers(res.data.users || []);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load users";
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, role, status]);

  const openModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const doAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === "promote") {
        await api.patch(`/admin/users/${selectedUser.id}/role`, {
          role: "admin",
        });
        notify("User promoted to admin", "success");
      }

      if (actionType === "demote") {
        await api.patch(`/admin/users/${selectedUser.id}/role`, {
          role: "student",
        });
        notify("User demoted to student", "success");
      }

      if (actionType === "deactivate") {
        await api.patch(`/admin/users/${selectedUser.id}/status`, {
          status: "inactive",
        });
        notify("User deactivated", "warning");
      }

      if (actionType === "activate") {
        await api.patch(`/admin/users/${selectedUser.id}/status`, {
          status: "active",
        });
        notify("User activated", "success");
      }

      if (actionType === "delete") {
        await api.delete(`/admin/users/${selectedUser.id}`);
        notify("User soft-deleted", "error");
      }

      if (actionType === "reset") {
        const res = await api.post(
          `/admin/users/${selectedUser.id}/reset-password`
        );
        notify(
          `Temporary password set: ${res.data.tempPassword}`,
          "success"
        );
      }

      load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Action failed";
      notify(msg, "error");
    } finally {
      closeModal();
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Manage Users
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View, edit, activate, deactivate or promote users in the system.
      </Typography>

      {/* Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
        variant="outlined"
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Search user"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          <TextField
            label="Role"
            select
            size="small"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <TextField
            label="Status"
            select
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        {busy ? (
          <Stack alignItems="center" sx={{ p: 3 }}>
            <CircularProgress />
          </Stack>
        ) : users.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 3, textAlign: "center" }}
          >
            No users found.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={u.role === "admin" ? "primary" : "default"}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={u.status}
                        size="small"
                        color={
                          u.status === "active"
                            ? "success"
                            : u.status === "inactive"
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        {u.role === "student" ? (
                          <IconButton
                            color="primary"
                            onClick={() => openModal(u, "promote")}
                          >
                            <VerifiedUserIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            color="warning"
                            onClick={() => openModal(u, "demote")}
                          >
                            <RestoreIcon />
                          </IconButton>
                        )}

                        {u.status === "active" ? (
                          <IconButton
                            color="warning"
                            onClick={() => openModal(u, "deactivate")}
                          >
                            <BlockIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            color="success"
                            onClick={() => openModal(u, "activate")}
                          >
                            <RestoreIcon />
                          </IconButton>
                        )}

                        <IconButton
                          color="error"
                          onClick={() => openModal(u, "delete")}
                        >
                          <DeleteIcon />
                        </IconButton>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openModal(u, "reset")}
                        >
                          Reset Password
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>
          {actionType === "promote" && "Promote User to Admin"}
          {actionType === "demote" && "Demote User"}
          {actionType === "deactivate" && "Deactivate User"}
          {actionType === "activate" && "Activate User"}
          {actionType === "delete" && "Delete User"}
          {actionType === "reset" && "Reset Password"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            <b style={{ textTransform: "capitalize" }}>{actionType}</b>{" "}
            <br /> user <b>{selectedUser?.full_name}</b>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={doAction}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
