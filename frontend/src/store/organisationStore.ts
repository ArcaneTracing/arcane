import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Organisation } from "@/api/organisations";


type OrganisationStore = {

  currentOrganisation: Organisation | null;
  organisations: Organisation[];


  setCurrentOrganisation: (organisation: Organisation | null) => void;
  setOrganisations: (organisations: Organisation[]) => void;
  clearOrganisation: () => void;
};


const useOrganisationStore = create<OrganisationStore>()(
  persist(
    (set) => ({

      currentOrganisation: null,
      organisations: [],


      setCurrentOrganisation: (organisation) => {
        set({ currentOrganisation: organisation });
      },


      setOrganisations: (organisations) => {
        set({ organisations });

        set((state) => {
          if (!state.currentOrganisation && organisations.length > 0) {
            return { currentOrganisation: organisations[0] };
          }
          return {};
        });
      },


      clearOrganisation: () => {
        set({ currentOrganisation: null, organisations: [] });
      }
    }),
    {
      name: "organisation-storage"
    }
  )
);


export const useCurrentOrganisation = () => useOrganisationStore((state) => state.currentOrganisation);
export const useOrganisations = () => useOrganisationStore((state) => state.organisations);
export const useSetCurrentOrganisation = () => useOrganisationStore((state) => state.setCurrentOrganisation);
export const useSetOrganisations = () => useOrganisationStore((state) => state.setOrganisations);
export const useClearOrganisation = () => useOrganisationStore((state) => state.clearOrganisation);

export default useOrganisationStore;