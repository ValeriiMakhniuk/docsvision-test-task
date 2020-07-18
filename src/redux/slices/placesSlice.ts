import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';

import { IPlace } from './../../interfaces';
import { getPlaces } from '../../services/firestore';

interface PlacesState {
  placeById: Record<string, IPlace>;
  allIds: string[];
  isLoading: boolean;
  error: string | null;
}

const placesInitialState: PlacesState = {
  placeById: {},
  allIds: [],
  isLoading: false,
  error: null,
};

function startLoading(state: PlacesState) {
  state.isLoading = true;
}

function loadingFailed(state: PlacesState, action: PayloadAction<string>) {
  state.isLoading = false;
  state.error = action.payload;
}

const placesSlice = createSlice({
  name: 'places',
  initialState: placesInitialState,
  reducers: {
    getPlacesStart: startLoading,
    getPlacesSucess(state, { payload }: PayloadAction<IPlace[]>) {
      state.isLoading = false;
      state.error = null;

      payload.forEach((place) => {
        state.allIds.push(place.id);
        state.placeById[place.id] = place;
      });
    },
    getPlacesFailure: loadingFailed,
  },
});

export const {
  getPlacesStart,
  getPlacesSucess,
  getPlacesFailure,
} = placesSlice.actions;
export default placesSlice.reducer;

export const fetchPlaces = (): AppThunk => async (dispatch) => {
  try {
    dispatch(getPlacesStart());
    const fetchedPlaces = await getPlaces();
    dispatch(getPlacesSucess(fetchedPlaces));
  } catch (error) {
    dispatch(getPlacesFailure(error.message));
  }
};
