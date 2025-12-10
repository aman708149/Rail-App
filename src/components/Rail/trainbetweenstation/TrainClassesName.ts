export enum TrainClasses {
    "2S" = "Second Sitting",
    "SL" = "Sleeper Class",
    "3A" = "AC 3 Tier",
    "2A" = "AC 2 Tier",
    "1A" = "AC First Class",
    "CC" = "AC Chair Car",
    "EC" = "Executive Chair Car",
    "GN" = "General",
    "3E" = 'Third AC Economy'
}

// Function to get full name of a class by its code
export function getTrainClassName(classCode: string): string {
    return TrainClasses[classCode as keyof typeof TrainClasses] || "Unknown Class";
}