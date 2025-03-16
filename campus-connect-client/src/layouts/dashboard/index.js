import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { useSelector, useDispatch } from "react-redux";
import { Client } from "@stomp/stompjs"; // STOMP client
import SockJS from "sockjs-client"; // SockJS client
import {
  AddDirectMessage,
  UpdateDirectConversation,
  AddDirectConversation,
} from "../../redux/slices/conversation";
import { showSnackbar, SelectConversation } from "../../redux/slices/app"; // Assuming you have a showSnackbar action

const DashboardLayout = () => {
  const { isLoggedIn, user_id } = useSelector((state) => state.auth);
  const { conversations, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const [stompClient, setStompClient] = useState(null); // STOMP client state
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn) {
      // Configure STOMP and SockJS
      const socket = new SockJS("http://localhost:8080/ws"); // Replace with your server URL
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000, // Optional: Configure reconnection delay
        debug: (str) => {
          console.log(str); // Optional: Log STOMP client debug messages
        },
      });

      setStompClient(client); // Set stompClient to state

      // Only activate the client after setting it
      client.onConnect = () => {
        console.log("Connected to STOMP server");

        // Subscribe to relevant channels
        client.subscribe(`/topic/messages/${user_id}`, (messageOutput) => {
          const message = JSON.parse(messageOutput.body);
          console.log("Received message:", message);

          // Check if the message is for the currently selected conversation
          if (current_conversation?.id === message.conversation_id) {
            dispatch(
              AddDirectMessage({
                id: message._id,
                type: "msg",
                subtype: message.type,
                message: message.text,
                incoming: message.to === user_id,
                outgoing: message.from === user_id,
              })
            );
          }
        });

        client.subscribe(`/topic/start_chat/${user_id}`, (chatData) => {
          const data = JSON.parse(chatData.body);
          console.log("Start chat data:", data);

          // Check if the conversation already exists
          const existingConversation = conversations.find((el) => el?.id === data._id);
          if (existingConversation) {
            // Update the conversation
            dispatch(UpdateDirectConversation({ conversation: data }));
          } else {
            // Add the new conversation
            dispatch(AddDirectConversation({ conversation: data }));
          }
          dispatch(SelectConversation({ room_id: data._id }));
        });

        client.subscribe(`/topic/request_sent/${user_id}`, (requestData) => {
          const data = JSON.parse(requestData.body);
          dispatch(showSnackbar({ severity: "success", message: data.message }));
        });
      };

      // Activate the client after configuring
      client.activate();
      
      // Cleanup on unmount or when `isLoggedIn` changes
      return () => {
        if (client) {
          client.deactivate(); // Deactivate STOMP client
        }
      };
    }

    // If not logged in, redirect to login page
    return () => {};
  }, [isLoggedIn, user_id, dispatch, conversations, current_conversation]);

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  return (
    <Stack direction="row">
      <SideBar />
      <Outlet />
    </Stack>
  );
};

export default DashboardLayout;
