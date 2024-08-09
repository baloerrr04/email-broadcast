export interface User {
    id: number,
    email: string,
    name: string | null,
    password: string
    appPassword: string | null,
}
