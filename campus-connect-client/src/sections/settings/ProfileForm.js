import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useForm, FormProvider } from "react-hook-form"; 
import { yupResolver } from "@hookform/resolvers/yup";
import CreateAvatar from "../../utils/createAvatar";
import { Button, Stack, Box, Typography, Divider, Alert } from "@mui/material";
import RHFTextField from "../../components/hook-form/RHFTextField"; 

const ProfileSchema = Yup.object().shape({
  nickname: Yup.string().required("Nickname is required"),
  about: Yup.string().required("About is required"),
});

const defaultValues = {
  nickname: "",
  about: "",
};

const ProfileForm = () => {
  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const { setValue, handleSubmit, control, formState: { errors } } = methods;

  const [isUpdated, setIsUpdated] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "", imageUrl: "" });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setValue("nickname", data.nickname || "");
          setValue("about", data.about || "");
          setProfileData({
            name: data.name || "N/A",
            email: data.email || "N/A",
            imageUrl: data.imageUrl || "",
          });
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
      const response = await fetch("http://localhost:8080/api/user/update", {
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
      } else {
        console.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error during submission", error);
    }
  };

  return (
    <FormProvider {...methods}> 
      <form onSubmit={handleSubmit(onSave)}>
        <Stack spacing={4}>
          
          <Box display="flex" justifyContent="center">
            <CreateAvatar
              name={profileData.name} 
              imageUrl={profileData.imageUrl} 
              size={56} 
            />
          </Box>

          <Box>
            <Typography variant="body1">
              <strong>Name:</strong> {profileData.name}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {profileData.email}
            </Typography>
            <Divider sx={{ marginY: 2 }} />
          </Box>

          <Box>
            <Stack spacing={3}>
              {isUpdated && <Alert severity="success">Profile updated successfully!</Alert>}
              {!!errors.afterSubmit && (
                <Alert severity="error">{errors.afterSubmit.message}</Alert>
              )}

              <RHFTextField
                name="nickname"
                label="Nickname"
                helperText="This nickname is visible to your contacts"
              />
              <RHFTextField
                multiline
                rows={3}
                maxRows={5}
                name="about"
                label="About"
              />
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="end" spacing={2}>
            <Button color="primary" size="large" type="submit" variant="contained">
              {isUpdated ? "Update Again" : "Save"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default ProfileForm;
