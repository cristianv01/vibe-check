import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  location: string;
  tags: string[];
  date: string;
  sort: string;
  order: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  coordinates: [number, number] | null;
}

export interface InitialStateTypes {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: "grid" | "list";
}

export const initialState: InitialStateTypes = {
  filters: {
    location: "",
    tags: [],
    date: "",
    sort: "",
    order: "",
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    coordinates: null,
  },
  isFiltersFullOpen: false,
  viewMode:"grid",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    }
  },
});

export const {
  setFilters,
  toggleFiltersFullOpen,
  setViewMode,
} = globalSlice.actions;

export default globalSlice.reducer;
