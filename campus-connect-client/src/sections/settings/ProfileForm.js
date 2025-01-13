import React, { useCallback, useState } from "react";
import FormProvider from "../../components/hook-form/FormProvider";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Stack } from "@mui/material";
import RHFTextField from "../../components/hook-form/RHFTextField";

const ProfileForm = () => {
  const ProfileSchema = Yup.object().shape({
    nikename: Yup.string().required("Nikename is required"),
    about: Yup.string().required("About is required"),

    avatarUrl: Yup.string().required("Avatar is required").nullable(true),
  });
  const defaultValues = {
    nikename: "",
    about: "",
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const values = watch();
  const [isUpdated, setIsUpdated] = useState(false);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("avatarUrl", newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:8080/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Trimite token-ul
        },
        body: JSON.stringify(data), // Trimite nickname și about
      });

      if (response.ok) {
        console.log("Profile updated successfully!");
        setIsUpdated(true); // Butonul se schimbă în Update
      } else {
        console.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error during submission", error);
      reset();
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Stack spacing={3}>
          {!!errors.afterSubmit && (
            <Alert severity="error">{errors.afterSubmit.message} </Alert>
          )}
          <RHFTextField
            name="nikename"
            label="Nikename"
            helperText={"This nikename is visible to your contacts"}
          />
          <RHFTextField
            multiline
            rows={3}
            maxRows={5}
            name="about"
            label="About"
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"end"}>
          <Button
            color="primary"
            size={"large"}
            type="submit"
            variant="outlined"
          >
            {isUpdated ? "Update" : "Save"}
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;
