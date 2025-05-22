import React, {useEffect, useState} from "react";
import {Box, Divider, IconButton, Menu, MenuItem, Stack, Typography,} from "@mui/material";
import {alpha, useTheme} from "@mui/material/styles";
import {DotsThreeVertical, DownloadSimple, FileText as FileIcon} from "phosphor-react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {useDispatch} from "react-redux";
import {starMessage} from "../../redux/slices/conversation";
import {fSmartTime} from "../../utils/formatTime";
import Microlink from "@microlink/react";
import {showSnackbar} from "../../redux/slices/app";
import {BASE_URL} from "../../config";

const MessageOption = ({el}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const dispatch = useDispatch();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleStarMessage = () => {
        dispatch(starMessage(el.id));
        dispatch(showSnackbar({
            severity: "success",
            message: "Message starred!",
        }))
        handleClose();
    };

    const Message_options = [
        {
            title: "Star message", action: handleStarMessage
        },
    ];

    return (
        <>
            <DotsThreeVertical
                size={20}
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
            />
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                <Stack spacing={1} px={1}>
                    {Message_options.map((el) => (
                        <MenuItem
                            key={el.title}
                            onClick={() => {
                                if (el.action) el.action();
                                handleClose();
                            }}
                        >
                            {el.title}
                        </MenuItem>
                    ))}
                </Stack>
            </Menu>
        </>
    );
};

const TextMsg = ({el, menu}) => {
    const theme = useTheme();
    const isIncoming = !el.outgoing;
    const [showTimestamp, setShowTimestamp] = React.useState(false);

    const handleToggleTimestamp = () => {
        setShowTimestamp(prev => !prev);
    };

    return (
        <Stack direction="column" alignItems={isIncoming ? "start" : "end"}>
            {isIncoming && el.sender?.name && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                        variant="caption"
                        sx={{color: theme.palette.text.secondary, pl: 0.5, pb: 0.2}}
                    >
                        {el.sender.name}
                    </Typography>
                    {el.starred ? (
                        <StarIcon sx={{fontSize: 16, color: "#FFD700"}}/>
                    ) : (
                        <StarBorderIcon sx={{fontSize: 16, color: theme.palette.text.secondary}}/>
                    )}
                </Stack>
            )}

            <Stack direction="row" justifyContent={isIncoming ? "start" : "end"} alignItems="flex-end" spacing={0.5}>
                <Box
                    px={1.5}
                    py={1.5}
                    sx={{
                        backgroundColor: isIncoming
                            ? alpha(theme.palette.background.default, 1)
                            : theme.palette.primary.main,
                        borderRadius: 1.5,
                        width: "max-content",
                        position: "relative",
                        cursor: "pointer",
                    }}
                    onClick={handleToggleTimestamp}
                >
                    <Typography
                        variant="body1"
                        color={isIncoming ? theme.palette.text : "#fff"}
                    >
                        {el.message}
                    </Typography>
                    {showTimestamp && el.createdAt && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: isIncoming ? theme.palette.text.secondary : "rgba(255,255,255,0.7)",
                                mt: 0.5,
                                fontSize: "0.65rem",
                            }}
                        >
                            {fSmartTime(el.createdAt)}
                        </Typography>
                    )}
                </Box>

                <Stack direction="column" alignItems="center" spacing={1.3}>
                    {menu && <MessageOption el={el}/>}
                </Stack>
            </Stack>
        </Stack>
    );
};

const MediaMsg = ({el}) => {
    const theme = useTheme();
    const isIncoming = !el.outgoing;

    const [image, setImage] = useState("");
    const [fileName, setFileName] = useState("image");

    const getMimeTypeFromBase64 = (base64) => {
        if (base64.startsWith("/9j/")) return "image/jpeg";
        if (base64.startsWith("iVBOR")) return "image/png";
        if (base64.startsWith("R0lGOD")) return "image/gif";
        if (base64.startsWith("UklGR")) return "image/webp";
        if (base64.startsWith("Qk")) return "image/bmp";
        return "application/octet-stream";
    };

    useEffect(() => {
        const prepareImage = async () => {
            try {
                if (el.media && el.media.length > 100) {
                    const mimeType = getMimeTypeFromBase64(el.media);
                    const imageUrl = `data:${mimeType};base64,${el.media}`;
                    setImage(imageUrl);
                    setFileName("image." + mimeType.split("/")[1]);
                } else if (el.mediaFilePath) {
                    const fileUrl = `${BASE_URL}/${el.mediaFilePath}`;
                    setImage(fileUrl);
                    const fileExtension = fileUrl.split(".").pop();
                    setFileName("image." + fileExtension);
                }
            } catch (error) {
                console.error("Error loading image:", error);
            }
        };

        prepareImage();
    }, [el.media, el.mediaPathFile]);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = image;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Stack direction="row" justifyContent={isIncoming ? "start" : "end"}>
            {isIncoming && el.sender?.name && (
                <Typography variant="caption" sx={{color: theme.palette.text.secondary, pl: 1, pb: 0.5}}>
                    {el.sender.name}
                </Typography>
            )}
            <Box
                px={1.5}
                py={1.5}
                sx={{
                    backgroundColor: isIncoming
                        ? alpha(theme.palette.background.default, 1)
                        : theme.palette.primary.main,
                    borderRadius: 1.5,
                    width: "max-content",
                }}
            >
                <Stack spacing={1}>
                    <Box
                        position="relative"
                        display="inline-block"
                        sx={{
                            "&:hover .download-btn": {
                                opacity: 1,
                                pointerEvents: "auto",
                            },
                        }}
                    >
                        <img
                            src={image}
                            alt={el.media}
                            style={{maxHeight: 210, borderRadius: "10px"}}
                        />
                        <IconButton
                            onClick={handleDownload}
                            size="small"
                            className="download-btn"
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                opacity: 0,
                                pointerEvents: "none",
                                transition: "opacity 0.3s ease",
                                "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.7)",
                                },
                            }}
                        >
                            <DownloadSimple size={16}/>
                        </IconButton>
                    </Box>
                    <Typography variant="body2" color={isIncoming ? theme.palette.text : "#fff"}>
                        {el.message}
                    </Typography>
                </Stack>
            </Box>
        </Stack>
    );
};

const DocMsg = ({el}) => {
    const theme = useTheme();
    const isIncoming = !el.outgoing;

    const [fileName, setFileName] = useState("");
    const [fileBlobUrl, setFileBlobUrl] = useState("");

    const getMimeTypeFromBase64 = (base64) => {
        if (base64.startsWith("JVBERi")) return "application/pdf";
        if (base64.startsWith("UEsDB")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (base64.startsWith("0M8R4")) return "application/msword";
        if (base64.startsWith("AAABAA")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return "application/octet-stream";
    };

    const guessMimeTypeFromExtension = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf':
                return 'application/pdf';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            default:
                return 'application/octet-stream';
        }
    };

    useEffect(() => {
        const media = el.media || el.mediaFilePath;
        if (!media) return;

        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(media) && media.length > 100;
        let extension = "bin";

        if (!isBase64) {
            const normalizedPath = media.replaceAll("\\", "/");
            const fileUrl = `${BASE_URL}/${normalizedPath}`;
            setFileBlobUrl(fileUrl);

            const pathParts = normalizedPath.split("/");
            const fileNameFromPath = pathParts[pathParts.length - 1] || "";
            const mimeType = guessMimeTypeFromExtension(fileNameFromPath);

            extension = mimeType.includes("wordprocessingml") ? "docx" :
                mimeType.includes("spreadsheetml") ? "xlsx" :
                    mimeType.split("/")[1] || "bin";

            setFileName(`document.${extension}`);
            return;
        }

        const mimeType = getMimeTypeFromBase64(media);
        extension = mimeType.includes("wordprocessingml") ? "docx" :
            mimeType.includes("spreadsheetml") ? "xlsx" :
                mimeType.split("/")[1] || "bin";

        const byteCharacters = atob(media);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, {type: mimeType});
        const blobUrl = URL.createObjectURL(blob);
        setFileBlobUrl(blobUrl);
        setFileName(`document.${extension}`);

        return () => {
            URL.revokeObjectURL(blobUrl);
        };
    }, [el.media, el.mediaFilePath]);



    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = fileBlobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Stack direction="row" justifyContent={isIncoming ? "start" : "end"}>
            {(isIncoming && el.sender?.name) && (
                <Typography
                    variant="caption"
                    sx={{color: theme.palette.text.secondary, pl: 1, pb: 0.5}}
                >
                    {el.sender?.name}
                </Typography>
            )}

            <Box
                px={1.5}
                py={1.5}
                sx={{
                    backgroundColor: isIncoming
                        ? alpha(theme.palette.background.default, 1)
                        : theme.palette.primary.main,
                    borderRadius: 1.5,
                    width: "max-content",
                }}
            >
                <Stack spacing={2}>
                    <Stack
                        p={2}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{
                            backgroundColor: theme.palette.grey[200],
                            borderRadius: 1,
                            minWidth: 200,
                        }}
                    >
                        <FileIcon size={32}/>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{flexGrow: 1, maxWidth: 150}}
                        >
                            {fileName}
                        </Typography>
                        <IconButton onClick={handleDownload}>
                            <DownloadSimple/>
                        </IconButton>
                    </Stack>

                    <Typography
                        variant="body2"
                        color={isIncoming ? theme.palette.text : "#fff"}
                    >
                        {el.message}
                    </Typography>
                </Stack>
            </Box>
        </Stack>
    );
};

const LinkMsg = ({el}) => {
    const theme = useTheme();
    const isIncoming = !el.outgoing;

    return (
        <Stack direction="row" justifyContent={isIncoming ? "start" : "end"}>
            {isIncoming && el.sender?.name && (
                <Typography
                    variant="caption"
                    sx={{color: theme.palette.text.secondary, pl: 1, pb: 0.5}}
                >
                    {el.sender.name}
                </Typography>
            )}
            <Box
                px={1.5}
                py={1.5}
                sx={{
                    backgroundColor: isIncoming
                        ? alpha(theme.palette.background.default, 1)
                        : theme.palette.primary.main,
                    borderRadius: 1.5,
                    width: "max-content",
                    maxWidth: 400,
                }}
            >
                <Stack spacing={2}>
                    <Box
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 1,
                            p: 1,
                            width: '100%',
                            maxWidth: '500px',
                        }}
                    >
                        <Microlink
                            url={el.message || el.content}
                            size="large"
                            width="100%"
                            style={{maxWidth: '100%'}}
                        />
                    </Box>

                    <Typography
                        variant="body2"
                        color={isIncoming ? theme.palette.text.primary : "#fff"}
                        sx={{wordBreak: "break-word"}}
                    >
                        <a href={el.message || el.content} target="_blank"
                           rel="noopener noreferrer">{el.message || el.content}</a>
                    </Typography>
                </Stack>
            </Box>
        </Stack>
    );
};


const ReplyMsg = ({el, menu}) => {
    const theme = useTheme();
    const isIncoming = !el.outgoing;
    return (
        <Stack direction="row" justifyContent={isIncoming ? "start" : "end"}>
            {isIncoming && el.sender?.name && (
                <Typography
                    variant="caption"
                    sx={{color: theme.palette.text.secondary, pl: 1, pb: 0.5}}
                >
                    {el.sender.name}
                </Typography>
            )}
            <Box
                px={1.5}
                py={1.5}
                sx={{
                    backgroundColor: isIncoming
                        ? alpha(theme.palette.background.paper, 1)
                        : theme.palette.primary.main,
                    borderRadius: 1.5,
                    width: "max-content",
                }}
            >
                <Stack spacing={2}>
                    <Stack
                        p={2}
                        direction="column"
                        spacing={3}
                        alignItems="center"
                        sx={{
                            backgroundColor: alpha(theme.palette.background.paper, 1),

                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="body2" color={theme.palette.text}>
                            {el.message}
                        </Typography>
                    </Stack>
                    <Typography
                        variant="body2"
                        color={isIncoming ? theme.palette.text : "#fff"}
                    >
                        {el.reply}
                    </Typography>
                </Stack>
            </Box>
            {menu && <MessageOption/>}
        </Stack>
    );
};

const Timeline = ({el}) => {
    const theme = useTheme();
    const messageTime = fSmartTime(el.createdAt);
    return (

        <Stack direction="row" alignItems={"center"} justifyContent="space-between">
            <Divider width="46%"/>
            <Typography variant="caption" sx={{color: theme.palette.text}}>
                {messageTime}
            </Typography>
            <Divider width="46%"/>
        </Stack>

    );
};

export {Timeline, MediaMsg, LinkMsg, DocMsg, TextMsg, ReplyMsg};