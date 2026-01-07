const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export interface ApiResponse<T> {
  _status: number;
  data?: T;
  error?: {
    type: string;
    message: string;
  };
}

export interface UserData {
  id: string;
  email: string;
  keycloak_user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  username: string;
  email_verified: boolean;
}

export const fetchUserProfile = async (
  accessToken: string
): Promise<ApiResponse<UserData>> => {
  console.log('API_BASE_URL:', API_BASE_URL);
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
};
