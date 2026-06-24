export type userType={
    name:string,
    email:string,
    image:string,
    password:string,
    role:"user"|"admin",
    comparePassword(password: string): Promise<boolean>;
}