import React, { useState } from "react";
import FormProvider from "../../components/hook-form/FormProvider";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  CircularProgress,
} from "@mui/material";
import RHFTextField from "../../components/hook-form/RHFTextField";
import { Eye, EyeSlash } from "phosphor-react";
import axios from "axios";
import { API_BASE_URL } from "../../constants";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    password: Yup.string().required("Password is required"),
  });

  const defaultValues = {
    name: "Demo",
    email: "demo@yahoo.com",
    password: "demo1234",
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    setLoading(true); 
    setError(""); 
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, data);
      
      if (response.status === 201) {
       
        window.location.href = '/auth/login';  
      } else {
        setError("Something went wrong. Please try again."); 
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Unknown error while recording.");
      } else {
        setError("Registration error. Please try again.");
      }
      reset(); 
    } finally {
      setLoading(false); 
    }
  };


  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!error && <Alert severity="error">{error}</Alert>}

        <RHFTextField name="name" label="Name" />
        <RHFTextField name="email" label="Email address" />
        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "text.primary",
            color: (theme) =>
              theme.palette.mode === "light" ? "common.white" : "grey.800",
            "&:hover": {
              bgcolor: "text.primary",
              color: (theme) =>
                theme.palette.mode === "light" ? "common.white" : "grey.800",
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Account"}
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default RegisterForm;
