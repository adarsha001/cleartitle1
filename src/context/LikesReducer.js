// context/LikesReducer.js
export const initialState = {
  likedProperties: [],
  loading: false,
  error: null,
  operationInProgress: null, // To track which property is being liked/unliked
};

export const likesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LIKED_PROPERTIES':
      return {
        ...state,
        likedProperties: action.payload,
        error: null,
      };
    
    case 'ADD_LIKED_PROPERTY':
      return {
        ...state,
        likedProperties: [...state.likedProperties, action.payload],
        error: null,
        operationInProgress: null,
      };
    
    case 'REMOVE_LIKED_PROPERTY':
      return {
        ...state,
        likedProperties: state.likedProperties.filter(id => id !== action.payload),
        error: null,
        operationInProgress: null,
      };
    
    case 'TOGGLE_LIKE_START':
      return {
        ...state,
        loading: true,
        error: null,
        operationInProgress: action.payload, // propertyId
      };
    
    case 'TOGGLE_LIKE_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        operationInProgress: null,
      };
    
    case 'TOGGLE_LIKE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        operationInProgress: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'RESET_LIKES':
      return initialState;
    
    default:
      return state;
  }
};

// Helper function to check if a property is liked
export const isPropertyLiked = (state, propertyId) => {
  return state.likedProperties.includes(propertyId);
};

// Helper function to check if a specific property operation is in progress
export const isOperationInProgress = (state, propertyId) => {
  return state.operationInProgress === propertyId && state.loading;
};