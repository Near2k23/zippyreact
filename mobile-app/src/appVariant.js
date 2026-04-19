import Constants from 'expo-constants';

const APP_VARIANT = Constants.expoConfig?.extra?.appVariant || 'rider';

export const isDriver = APP_VARIANT === 'driver';
export const isRider = APP_VARIANT === 'rider';

export default APP_VARIANT;
