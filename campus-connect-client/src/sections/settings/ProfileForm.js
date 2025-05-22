import React, {useEffect, useState} from "react";
import * as Yup from "yup";
import {FormProvider, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import CreateAvatar from "../../utils/createAvatar";
import {Alert, Box, Button, Divider, Stack, Typography} from "@mui/material";
import RHFTextField from "../../components/hook-form/RHFTextField";
import {useDispatch, useSelector} from "react-redux";
import {FetchUserProfile, showSnackbar, UploadUserImage} from "../../redux/slices/app";
import {BASE_URL} from "../../config";

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

    const {
        setValue,
        handleSubmit,
        formState: {errors},
    } = methods;

    const [isUpdated, setIsUpdated] = useState(false);
    const {user_id} = useSelector((state) => state.auth);
    const token = useSelector((state) => state.auth.accessToken);
    const {user} = useSelector((state) => state.app);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(FetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            setValue("nickname", user.nickname || "");
            setValue("about", user.about || "");
        }
    }, [user, setValue]);

    const onSave = async (formData) => {
        const completeForm = {
            ...formData,
            id: user_id,
        };

        const dataToSend = new FormData();
        dataToSend.append(
            "updatedUserDto",
            new Blob([JSON.stringify(completeForm)], {type: "application/json"})
        );

        try {
            const response = await fetch(`${BASE_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: dataToSend,
            });

            if (response.ok) {
                await response.json();
                setIsUpdated(true);
                dispatch(FetchUserProfile());
                dispatch(showSnackbar({severity: "success", message: "Successfully updated"}));
            } else {
                console.error("Error updating profile");
                dispatch(showSnackbar({severity: "danger", message: "Error updating"}));
            }
        }
        catch (error) {
            console.error("Error during submission", error);
        }
    };


    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSave)}>
                <Stack spacing={4}>
                    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
                        <CreateAvatar
                            name={user?.name || ""}
                            imageUrl={`${BASE_URL}/${user.imageUrl}?${Date.now()}`}
                            size={56}
                        />
                        <Button
                            component="label"
                            variant="contained"
                            sx={{borderRadius: "50%", minWidth: 0, width: 36, height: 36}}
                        >
                            +
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        dispatch(UploadUserImage(e.target.files[0]));
                                    }
                                }}
                            />
                        </Button>
                    </Box>

                    <Box>
                        <Typography variant="body1">
                            <strong>Name:</strong> {user?.name || "N/A"}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Email:</strong> {user?.email || "N/A"}
                        </Typography>
                        <Divider sx={{marginY: 2}}/>
                    </Box>

                    <Box>
                        <Stack spacing={3}>
                            {isUpdated && (
                                <Alert severity="success">Profile updated successfully!</Alert>
                            )}
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
                        <Button
                            color="primary"
                            size="large"
                            type="submit"
                            variant="contained"
                        >
                            {isUpdated ? "Update Again" : "Save"}
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </FormProvider>
    );
};

export default ProfileForm;
