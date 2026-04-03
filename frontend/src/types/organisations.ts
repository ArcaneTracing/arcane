
export interface OrganisationResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganisationRequest {
  name: string;
}

export interface UpdateOrganisationRequest {
  name?: string;
}

export interface AddUserToOrganisationRequest {
  email: string;
}

export interface RemoveUserFromOrganisationRequest {
  email: string;
}

export interface OrganisationMessageResponse {
  message: string;
}