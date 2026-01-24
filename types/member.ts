import { Role } from '@/lib/constants';

export interface Profile {
    id: string;
    full_name: string;
    role: Role;
    department: string | null;
    created_at: string;
    updated_at: string;
}
