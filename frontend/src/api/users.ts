import api from './api';


export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  picture?: string;
}
export async function updateUserProfile(body: UpdateUserDto) {
  const { data } = await api.put<User>('/users/me', body);
  return data;
}