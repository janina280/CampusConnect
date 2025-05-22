import React, {useState} from "react";
import FormProvider from "../../components/hook-form/FormProvider";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Alert, Button, IconButton, InputAdornment, Stack,} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import RHFTextField from "../../components/hook-form/RHFTextField";
import {Eye, EyeSlash} from "phosphor-react";
import {RegisterUser} from "../../redux/slices/auth";
import {useNavigate} from "react-router-dom";
import {varBounce, varHover} from "../../components/animate";
import {motion} from "framer-motion";

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const {isLoading} = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const RegisterSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
            .required("Email is required")
            .email("Email must be a valid email address"),
        password: Yup.string().required("Password is required"),
    });

    const defaultValues = {
        name: "Demo",
        email: "demo@campusconnect.com",
        password: "demo1234",
    };

    const methods = useForm({
        resolver: yupResolver(RegisterSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: {errors},
    } = methods;

    const onSubmit = async (data) => {
        try {
            dispatch(RegisterUser(data, navigate));
        }
        catch (error) {
            console.error(error);
            reset();
        }
    };

    return (
        <motion.div
            variants={varBounce().inUp}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    {!!errors.afterSubmit && (
                        <Alert severity="error">{errors.afterSubmit.message}</Alert>
                    )}
                    <RHFTextField name="name" label="Name"/>
                    <RHFTextField name="email" label="Email address"/>
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
                                        {showPassword ? <Eye/> : <EyeSlash/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <motion.div variants={varHover(1.05)} whileHover="hover">
                        <Button
                            fullWidth
                            color="inherit"
                            size="large"
                            type="submit"
                            variant="contained"
                            loading={isLoading}
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
                        >
                            Create Account
                        </Button>
                    </motion.div>
                </Stack>
            </FormProvider>
        </motion.div>
    );
};

export default RegisterForm;
