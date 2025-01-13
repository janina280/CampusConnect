import React, { useState, useEffect } from "react";
import FormProvider from "../../components/hook-form/FormProvider";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Stack } from "@mui/material";
import RHFTextField from "../../components/hook-form/RHFTextField";

const ProfileForm = () => {
  const ProfileSchema = Yup.object().shape({
    nickname: Yup.string().required("Nickname is required"),
    about: Yup.string().required("About is required"),
  });

  const defaultValues = {
    nickname: "",
    about: "",
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const [isEditMode, setIsEditMode] = useState(false); 
  const [isUpdated, setIsUpdated] = useState(false); 

  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:8080/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setValue("nickname", data.nickname);
          setValue("about", data.about);
        } else {
          console.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    fetchProfileData();
  }, [setValue]);

  
  const onSave = async (data) => {
    try {
      const response = await fetch("http://localhost:8080/profile/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Profile updated successfully!");
        setIsUpdated(true);
        setIsEditMode(false); 
      } else {
        console.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error during submission", error);
      reset();
    }
  };

  const onEdit = () => {
    setIsEditMode(true);
    setIsUpdated(false);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSave)}>
      <Stack spacing={3}>
        <Stack spacing={3}>
          {!!errors.afterSubmit && (
            <Alert severity="error">{errors.afterSubmit.message}</Alert>
          )}

          <RHFTextField
            name="nickname"
            label="Nickname"
            helperText={"This nickname is visible to your contacts"}
            disabled={!isEditMode}
          />
          <RHFTextField
            multiline
            rows={3}
            maxRows={5}
            name="about"
            label="About"
            disabled={!isEditMode} 
          />
        </Stack>

        <Stack direction={"row"} justifyContent={"end"} spacing={2}>
          {isEditMode ? (
            <Button color="primary" size="large" type="submit" variant="outlined">
              Save
            </Button>
          ) : (
            <Button color="secondary" size="large" onClick={onEdit} variant="contained">
              Edit
            </Button>
          )}
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;
