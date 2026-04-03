import { create } from "zustand";
import { Profile } from "@/types/auth";
import { clearPermissionsCache } from "@/api/permissions";


type AuthStore = {

  profile: Profile | null;


  setProfile: (profile: Profile) => void;
  logout: () => void;
};


const useAuthStore = create<AuthStore>((set) => ({

  profile: null,


  setProfile: (profile: Profile) => {
    set({ profile });
  },


  logout: () => {

    clearPermissionsCache();
    set({ profile: null });
  }
}));


export const useAuthProfile = () => useAuthStore((state) => state.profile);
export const useAuthName = () => useAuthStore((state) => state.profile?.name);
export const useAuthEmail = () => useAuthStore((state) => state.profile?.email);
export const useAuthPicture = () => useAuthStore((state) => state.profile?.picture);
export const useSetAuthProfile = () => useAuthStore((state) => state.setProfile);
export const useLogout = () => useAuthStore((state) => state.logout);

export default useAuthStore;