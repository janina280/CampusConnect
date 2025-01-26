import { useSelector } from "react-redux";
import {jwtDecode} from "jwt-decode";

export const useCurrentUserFromToken = () => {
  const token = useSelector((state) => state.auth.accessToken);

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded; 
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
