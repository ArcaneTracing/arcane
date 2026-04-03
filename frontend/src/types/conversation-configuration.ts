
export interface ConversationConfigurationResponse {
  id: string;
  name: string;
  description?: string;
  stitchingAttributesName: string[];
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateConversationConfigurationRequest {
  name: string;
  description?: string;
  stitchingAttributesName: string[];
}
export interface UpdateConversationConfigurationRequest {
  name?: string;
  description?: string;
  stitchingAttributesName?: string[];
}