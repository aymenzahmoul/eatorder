import {createSlice} from '@reduxjs/toolkit';

const rootInitialState = {
  isLoading: false,
  rootRef: null,
};

export const rootSlice = createSlice({
  name: 'root',
  initialState: rootInitialState,
  reducers: {
    setRootLoading: (state, action) => {
      //console.log('setRootLoading-> ', action.payload);
      state.isLoading = action.payload;
    },
    setRootRef: (state, action) => {
      //console.log('payload', action.payload);
      state.rootRef = action.payload;
    },
  },
});

export const {setRootLoading, setRootRef} = rootSlice.actions;


