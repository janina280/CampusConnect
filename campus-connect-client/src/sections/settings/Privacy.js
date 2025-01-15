import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Switch,
} from "@mui/material";

const Privacy = ({ open, handleClose }) => {
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [callsAllowed, setCallsAllowed] = useState(true);

  const handleChange = (event, setter) => {
    setter(event.target.checked);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Privacy Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {/* Profile Privacy */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>Profile Visibility</Typography>
            <Switch
              checked={profileVisibility}
              onChange={(e) => handleChange(e, setProfileVisibility)}
              color="primary"
            />
          </Stack>

          {/* Last Seen */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>Last Seen</Typography>
            <Switch
              checked={lastSeen}
              onChange={(e) => handleChange(e, setLastSeen)}
              color="primary"
            />
          </Stack>

          {/* Read Receipts */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>Read Receipts</Typography>
            <Switch
              checked={readReceipts}
              onChange={(e) => handleChange(e, setReadReceipts)}
              color="primary"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Privacy;
