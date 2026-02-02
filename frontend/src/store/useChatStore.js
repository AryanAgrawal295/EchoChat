import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  _socketHandler: null, // ✅ NEW

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // ✅ de-duplicate by _id
      if (messages.some(m => m._id === res.data._id)) return;

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Message failed");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    const handleNewMessage = (newMessage) => {
      const { messages } = get();

      // only messages for this chat
      if (
        newMessage.senderId !== selectedUser._id &&
        newMessage.receiverId !== selectedUser._id
      ) {
        return;
      }

      // prevent duplicates
      if (messages.some(m => m._id === newMessage._id)) return;

      set({ messages: [...messages, newMessage] });
    };

    socket.on("newMessage", handleNewMessage);
    set({ _socketHandler: handleNewMessage });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const handler = get()._socketHandler;

    if (handler) {
      socket.off("newMessage", handler);
      set({ _socketHandler: null });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));


// import { create } from "zustand"
// import toast from "react-hot-toast"
// import { axiosInstance } from  "../lib/axios"
// import { useAuthStore } from "./useAuthStore"

// export const useChatStore = create((set,get) => ({
//   messages: [],
//   users: [],
//   selectedUser: null,
//   isUsersLoading: false,
//   isMessagesLoading: false,

//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const res = await axiosInstance.get("/messages/users");
//       set({ users: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   getMessages: async (userId) => {
//     set({ isMessagesLoading: true });
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       set({ messages: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },
//   sendMessage: async (messageData) => {
//     const {selectedUser, messages} = get()
//     try {
//       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
//       set({messages: [...messages,res.data]})
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   },

//   subscribeToMessages: () => { 
//     const { selectedUser } = get();
//     if(!selectedUser) return;

//     const socket = useAuthStore.getState().socket;
   
//     socket.on("newMessage", (newMessage) => { 
//       const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
//       if(!isMessageSentFromSelectedUser) return;

//       set({messages: [...get().messages, newMessage]})
//     })
//   },
//    unsubscribeFromMessages: () => {
//     const socket = useAuthStore.getState().socket;
//     socket.off("newMessage");
//   },

//   setSelectedUser: (selectedUser) => set({ selectedUser })
// }))

