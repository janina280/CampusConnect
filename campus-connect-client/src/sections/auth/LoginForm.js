import React, {useState} from "react";
import FormProvider from "../../components/hook-form/FormProvider";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Alert, Button, InputAdornment, Stack,} from "@mui/material";
import RHFTextField from "../../components/hook-form/RHFTextField";
import {Eye, EyeSlash} from "phosphor-react";
import {useDispatch, useSelector} from "react-redux";
import {LoginUser} from "../../redux/slices/auth";
import {motion} from "framer-motion";
import {IconButtonAnimate, varBounce, varHover} from "../../components/animate";


const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const {isLoading} = useSelector((state) => state.auth);
    const [error, setError] = useState("");
    const LoginSchema = Yup.object().shape({
        email: Yup.string()
            .required("Email is required")
            .email("Email must be a valid email address"),
        password: Yup.string().required("Password is required"),
    });

    const dispatch = useDispatch();

    const defaultValues = {
        email: "demo@campusconnect.com",
        password: "demo1234",
    };

    const methods = useForm({
        resolver: yupResolver(LoginSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: {errors, isSubmitting, isSubmitSuccessful},
    } = methods;

    const onSubmit = async (data) => {
        setError("");
        try {
            const result = await dispatch(LoginUser(data));

            if (result && result.success === false) {
                setError(result.error);
                reset({email: "", password: ""});
            }

        }
        catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong. Please try again.");
            reset({email: "", password: ""});
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
                    {!!error && <Alert severity="error">{error}</Alert>}

                    <RHFTextField name="email" label="Email address"/>
                    <RHFTextField
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButtonAnimate onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <Eye/> : <EyeSlash/>}
                                    </IconButtonAnimate>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
                <Stack alignItems={"flex-end"} sx={{my: 2}}>

                </Stack>
                <motion.div variants={varHover(1.05)} whileHover="hover">
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
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Login"}
                    </Button>
                </motion.div>

            </FormProvider>
        </motion.div>
    );
};

export default LoginForm;
