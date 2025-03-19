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
import { useSelector, useDispatch } from "react-redux";
import { FetchAllUsers, showSnackbar } from "../../redux/slices/app";
import { AddDirectGroupConversation } from "../../redux/slices/conversation";

const CreateGroupForm = ({ handleClose, handleGroupCreated }) => {
  const dispatch = useDispatch();
  const all_users = useSelector((state) => state.app.all_users);

  useEffect(() => {
    dispatch(FetchAllUsers());
  }, [dispatch]);

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

  const { handleSubmit } = methods;

  const onSubmit = async (data) => {
    const userIds = data.members.map((member) => member.id);

    const requestData = {
      name: data.title,
      isGroup: true,
      userIds: userIds,
    };

    try {
      const newGroup=await dispatch(AddDirectGroupConversation({
        name: data.title,
        conversation: requestData,
      }));
      dispatch(
          showSnackbar({
            severity: "success",
            message: "Group created successfully!",
          })
      );
      handleGroupCreated(newGroup);
      handleClose();
    } catch (error) {
      console.error("Error creating group:", error);
      dispatch(
          showSnackbar({
            severity: "error",
            message: "Failed to create group.",
          })
      );
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
              options={all_users || []}
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

const CreateGroup = ({ open, handleClose }) => {
  return (
      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose} >
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <CreateGroupForm handleClose={handleClose}  />
        </DialogContent>
      </Dialog>
  );
};

export default CreateGroup;
