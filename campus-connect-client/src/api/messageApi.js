import {BASE_URL} from "../config";

export async function fetchLast3Images(chatId, token) {
    const response = await fetch(`${BASE_URL}/api/message/last-3-images/${chatId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch last 3 images');
    }
    return response.json();
}
