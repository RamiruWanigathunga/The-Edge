import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProfileState = {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      name: "Wenuja Liyanamana",
      email: "wenujaweb@gmail.com",
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
    }),
    { name: "edge-profile-v1" }
  )
);
