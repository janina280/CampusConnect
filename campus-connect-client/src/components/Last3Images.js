// src/components/Last3Images.js
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {ImageList, ImageListItem, Typography} from "@mui/material";
import {fetchLast3Images} from "../api/messageApi";
import {BASE_URL} from "../config"; // sau cum ai tu structurat

const Last3Images = ({chatId}) => {
    const [images, setImages] = useState([]);
    const token = useSelector((state) => state.auth.accessToken);

    useEffect(() => {
        if (!chatId || !token) return;
        fetchLast3Images(chatId, token)
            .then(data => setImages(data))
            .catch(err => console.error("Error fetching last 3 images:", err));
    }, [chatId, token]);

    if (images.length === 0) {
        return <Typography>No images found.</Typography>;
    }

    return (
        <ImageList cols={3} rowHeight={120}>
            {images.map((img) => (
                <ImageListItem key={img.id}>
                    <img
                        src={`${BASE_URL}/${img.mediaFilePath.replace(/\\/g, '/')}`}
                        alt={`Image ${img.id}`}
                        loading="lazy"
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
};

export default Last3Images;
