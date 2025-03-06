import { createSlice } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";
import axios from "../../utils/axios"

const user_id = window.localStorage.getItem("user_id");

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
  },
  group_chat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((el) => {
        const user = el.users?.find((elm) => {
          console.log('Checking user', elm);
          return elm.id.toString() !== user_id;
        });
     
        return {
          id: el.id,
          name: `${user?.name}`,
          nickname: `${user?.nickname}`,
          msg: el.messages.slice(-1)[0]?.text, 
          time: "9:36",
          unread: 0,
          pinned: false,
          about: user?.about,
          online: user?.status === "Online",
          urlImg: faker.image.avatar(),
        };
      });

      state.direct_chat.conversations = list;
    },
    updateDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            return {
              id: this_conversation._id._id,
              user_id: user?._id,
              name: `${user?.firstName} ${user?.lastName}`,
              online: user?.status === "Online",
              img: faker.image.avatar(),
              msg: faker.music.songName(),
              time: "9:36",
              unread: 0,
              pinned: false,
            };
          }
        }
      );
    },
    addDirectConversation(state, action) {
      const newChat = action.payload.conversation;
      if (!state.direct_chat.conversations.find((chat) => chat.id === newChat.id)) {
        state.direct_chat.conversations.push(newChat);
      }
    },
    setCurrentConversation(state, action) {
      state.direct_chat.current_conversation = action.payload;
    },
    fetchCurrentMessages(state, action) {
      const messages = action.payload.messages;
      const formatted_messages = messages.map((el) => ({
        id: el._id,
        type: "msg",
        subtype: el.type,
        message: el.text,
        incoming: el.to === user_id,
        outgoing: el.from === user_id,
      }));
      state.direct_chat.current_messages = formatted_messages;
    },
    addDirectMessage(state, action) {
      state.direct_chat.current_messages.push(action.payload.message);
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = () => {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.accessToken;

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get("/api/chat/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        console.log("test: ", response.data )
      dispatch(
        slice.actions.fetchDirectConversations({ conversations: response.data || [] })
);

    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };
};

export const AddDirectConversation = (userId) => async (dispatch, getState) => {
  try {
    const token = getState().auth.accessToken;

    // Verificăm dacă există un chat cu utilizatorul respectiv
    const existingChat = getState().conversation.direct_chat.conversations.find(
      (chat) => chat.users.length === 2 && chat.users.some((user) => user.id === userId)
    );

    if (existingChat) {
      console.log("Chat already exists with this user");
      return;
    }

    // Creăm un nou chat
    const response = await axios.post(
      "/api/chat",
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      dispatch(slice.actions.addDirectConversation({ conversation: response.data }));
      console.log("New chat created", response.data);
      return response.data;  // Întoarcem chatul creat
    } else {
      console.error("Failed to create chat");
    }
  } catch (error) {
    console.error("Error creating chat:", error);
  }
};


export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};

export const SetCurrentConversation = (current_conversation) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setCurrentConversation(current_conversation));
  };
};


export const FetchCurrentMessages = ({messages}) => {
  return async(dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({messages}));
  }
}

export const AddDirectMessage = (message) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectMessage({message}));
  }
}
