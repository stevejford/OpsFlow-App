export interface Credential {
  id: string;
  name: string;
  category: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string[];
  expirationDate?: string;
  lastUpdated: string;
  createdBy?: string;
  status: 'active' | 'inactive' | 'expired';
  strength?: 'weak' | 'medium' | 'strong';
}

export interface CredentialCategory {
  id: string;
  name: string;
  description?: string;
}

export interface CredentialFormValues extends Omit<Credential, 'id' | 'lastUpdated' | 'createdBy' | 'strength'> {
  id?: string;
  confirmPassword?: string;
}
