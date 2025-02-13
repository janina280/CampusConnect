import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../redux/slices/app";

const CreateGroupForm = ({ handleClose, handleGroupCreated }) => {
  const [users, setUsers] = useState([]);
  const token = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();

  const fetchUsers = async () => {
    if (!token) {
      console.error("Token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/user/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    members: Yup.array().min(2, "Must have at least 2 members"),
  });

  const defaultValues = {
    title: "",
    members: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const { handleSubmit, reset, setError } = methods;

  const onSubmit = async (data) => {
    const userIds = data.members.map((member) => member.id);

    const requestData = {
      name: data.title,
      userIds: userIds,
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const newGroup = await response.json(); 
        handleGroupCreated(newGroup); 
        dispatch(
          showSnackbar({
            severity: "success",
            message: "Group created successfully!",
          })
        );
        handleClose();
      } else {
        console.error("Failed to create group, status:", response.status);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Title" />
        <RHFAutocomplete
          name="members"
          label="Members"
          multiple
          options={users}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <Stack direction="row" justifyContent="end" spacing={2}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const CreateGroup = ({ open, handleClose, handleGroupCreated }) => {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <CreateGroupForm handleClose={handleClose} handleGroupCreated={handleGroupCreated} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
