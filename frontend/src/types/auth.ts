
export interface Profile {
  name: string;
  picture?: string;
  email: string;
}


export interface AuthResponse {
  profile: Profile;
  loggedIn: boolean;


}