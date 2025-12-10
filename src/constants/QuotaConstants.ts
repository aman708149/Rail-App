export enum Quota {
    GN = "General",
    TQ = "Tatkal",
    LD = "Ladies",
    SS = "Senior Citizen",
    PT = "Pre Tatkal",
}

export const quotaStyles: { [key in keyof typeof Quota]?: string } = {
    GN: "bg-primary/50", // General
    TQ: "bg-danger/50", // Tatkal
    LD: "bg-warning/50", // Ladies
    SS: "bg-info/50", // Senior Citizen
    PT: "bg-secondary/50", // Pre Tatkal
};
