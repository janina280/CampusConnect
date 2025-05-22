import React, {useEffect} from "react";
import {Box, Button, Chip, Dialog, DialogContent, DialogTitle, Stack,} from "@mui/material";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import FormProvider from "../../components/hook-form/FormProvider";
import {RHFTextField} from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import {useDispatch, useSelector} from "react-redux";
import {FetchAllUsers, showSnackbar} from "../../redux/slices/app";
import {useWebSocket} from "../../contexts/WebSocketContext";
import CreateAvatar from "../../utils/createAvatar";
import {BASE_URL} from "../../config";

const CreateGroupForm = ({handleClose}) => {
    const dispatch = useDispatch();
    const all_users = useSelector((state) => state.app.all_users);
    const token = useSelector((state) => state.auth.accessToken);
    const {isConnected, socket} = useWebSocket();

    useEffect(() => {
        dispatch(FetchAllUsers());
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

    const {handleSubmit} = methods;

    const onSubmit = async (data) => {
        const userIds = data.members.map((member) => member.id);

        const requestData = {
            name: data.title,
            userIds: userIds,
            jwt: "Bearer " + token,
        };

        try {
            if (!isConnected) {
                throw new Error("The Socket is not connected");
            }
            socket.emit("/app/group-create", requestData);

            dispatch(
                showSnackbar({
                    severity: "success",
                    message: "Group created successfully!",
                })
            );
            handleClose();
        }
        catch (error) {
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
            <Stack spacing={4}>
                <RHFTextField name="title" label="Title"/>
                <RHFAutocomplete
                    name="members"
                    label="Members"
                    multiple
                    options={all_users || []}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            <CreateAvatar
                                imageUrl={`${BASE_URL}/${option.imageUrl}`}
                                src={option.imageUrl}
                                alt={option.name}
                                sx={{width: 24, height: 24, mr: 1}}
                            />
                            <div>
                                <div>{option.name}</div>
                                <div style={{fontSize: 12, color: "#888"}}>{option.email}</div>
                            </div>
                        </li>
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                key={option.id}
                                label={option.name}
                                avatar={<CreateAvatar imageUrl={`${BASE_URL}/${option.imageUrl}`}
                                                      src={option.imageUrl}/>}
                                {...getTagProps({index})}
                            />
                        ))
                    }
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

const CreateGroup = ({open, handleClose}) => {
    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogContent>
                <Box sx={{mt: 3}}>
                    <CreateGroupForm handleClose={handleClose}/>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGroup;
