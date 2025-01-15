import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

const RequestAccountInfo = ({ open, handleClose }) => {
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Request Account Info</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You can request a report of your account information and settings.
        </Typography>
        <Typography variant="body2">
          The report will include your account details, messages, and media.
          Once you request the information, it may take up to 3 days to generate
          the report. You'll receive a notification when it's ready for
          download.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => alert("Request Sent")}>
          Request Info
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestAccountInfo;
