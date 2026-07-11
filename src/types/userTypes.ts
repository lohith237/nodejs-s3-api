// types.ts
export type UserRole = "admin" | "client" | "manager" | "employee";

export interface userType {
    name: string;
    email: string;
    image?: string;
    password: string;
    role: UserRole;
    tenant_id: string;
    company_name?: string;
    subdomain?: string;
    database?: string;
    is_active: boolean;
    compare_password(password: string): Promise<boolean>;
}