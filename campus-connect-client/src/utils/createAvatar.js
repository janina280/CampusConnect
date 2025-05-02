import React from 'react';
import {Avatar} from '@mui/material';

const CreateAvatar = ({ name, imageUrl, size = 56 }) => {
  const COLORS = {
    primary: '#1976d2',
    info: '#0288d1',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    default: '#9e9e9e',
  };

  const PRIMARY_NAME = ['A', 'N', 'H', 'L', 'Q', '9', '8'];
  const INFO_NAME = ['F', 'G', 'T', 'I', 'J', '1', '2', '3'];
  const SUCCESS_NAME = ['K', 'D', 'Y', 'B', 'O', '4', '5'];
  const WARNING_NAME = ['P', 'E', 'R', 'S', 'C', 'U', '6', '7'];
  const ERROR_NAME = ['V', 'W', 'X', 'M', 'Z'];

  function getFirstCharacter(name) {
    return name && name.charAt(0).toUpperCase();
  }

  function getAvatarColor(name) {
    const firstChar = getFirstCharacter(name);
    if (PRIMARY_NAME.includes(firstChar)) return COLORS.primary;
    if (INFO_NAME.includes(firstChar)) return COLORS.info;
    if (SUCCESS_NAME.includes(firstChar)) return COLORS.success;
    if (WARNING_NAME.includes(firstChar)) return COLORS.warning;
    if (ERROR_NAME.includes(firstChar)) return COLORS.error;
    return COLORS.default;
  }

  const avatarStyle = {
    width: size,
    height: size,
    backgroundColor: imageUrl ? undefined : getAvatarColor(name),
  };

  return (
      <Avatar sx={avatarStyle} alt={name} src={imageUrl || undefined}>
        {!imageUrl && getFirstCharacter(name)}
      </Avatar>
  );
};

export default CreateAvatar;
