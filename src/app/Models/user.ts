import { Role } from "./role";

export interface User {
    id: number,
    username: string,
    email: string,
    password: string,
    fullName: string|null,
    address: string | null,
    role: string,
    enabled: boolean
}
