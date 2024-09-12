enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
}

export interface User {
    id: number,
    email: string,
    name: string | null,
    password: string
    role: Role,
}
