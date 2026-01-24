import { Role } from '@/lib/constants';

export interface Profile {
    id: string;
    full_name: string | null;
    role: Role | null;
    created_at?: string;
    updated_at?: string;
}
