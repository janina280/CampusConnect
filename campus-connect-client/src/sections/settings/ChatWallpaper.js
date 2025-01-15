import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Stack,
  Box,
} from "@mui/material";

const ChatWallpaper = ({ open, handleClose }) => {
  const wallpapers = [
    " https://www.aiseesoft.com/images/resource/whatsapp-images/bonfire-wallpaper.jpg",
    "https://www.aiseesoft.com/images/resource/whatsapp-images/mountain-wallpaper.jpg",
    "https://www.aiseesoft.com/images/resource/whatsapp-images/golden-feather.jpg",
    "https://www.aiseesoft.com/images/resource/whatsapp-images/green-wallpaper.jpg",
    "https://www.aiseesoft.com/images/resource/whatsapp-images/snow-and-mountain.jpg",
    "https://www.aiseesoft.com/images/resource/whatsapp-images/roses-and-night.jpg",
    "https://www.aiseesoft.com/images/resource/whatsapp-images/baymax-wallpaper.jpg",
  ];

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle>Select a Chat Wallpaper</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Personalize your chat by choosing a wallpaper from the options below.
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {wallpapers.map((wallpaper, index) => (
            <Box
              key={index}
              sx={{
                width: 100,
                height: 100,
                backgroundImage: `url(${wallpaper})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 2,
                cursor: "pointer",
                boxShadow: 3,
                marginBottom: 2,
              }}
              onClick={() => alert(`You selected: ${wallpaper}`)} // Add save logic here
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatWallpaper;
