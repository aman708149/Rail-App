export enum Roles {
    AGENT = 'agent',
    PARTNER = 'partner',
    ADMIN = 'admin',
}

export enum SourceEnum {
    MAGIC_LINK = 'magiclink',
    EMULATE = 'emulate',
    DIRECT = 'direct',
}
export interface LoginActivity {
    _id: string;
    userID: string;
    ownerID: string;
    role: Roles; // adjust based on possible values
    ipAddress: string;
    device: string;
    browser: string;
    isSuccess: boolean;
    source: SourceEnum; // adjust based on possible values
    loginAt: string;
    createdAt: string;
    updatedAt: string;
    failureReason?: string; // optional, as it may not always be present
    emulatedBy : string | null; // ID of the user who emulated this login, if any
    __v: number;
}