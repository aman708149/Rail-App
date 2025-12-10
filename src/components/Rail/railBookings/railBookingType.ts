// Enums
export enum BookingStatus {
    Pending = 'Pending',
    Booked = 'Booked',
    Failed = 'Failed',
    Cancelled = 'Cancelled',
    PartiallyCancelled = 'Partially Cancelled',
}

export enum ReservationMode {
    B2B_WEB_OTP = 'B2B_WEB_OTP',
    WS_TA_B2B = 'WS_TA_B2B',
}

// Interfaces
export interface RailBookingType {
    _id: string;
    RBrequest: {
        reservationMode: ReservationMode;
        passengerList: Passenger[];
        infantList: any[]; // Define if known
        boardingStation: string;
        gstDetails: {
            gstin: string;
            gstStateCode: string;
            gstStateName: string;
        };
    };
    RBresponse: {
        trainNo: string;
        from: string;
        to: string;
        enqClass: string;
        quota: string;
        totalCollectibleAmount: string;
        avlDayList: Availability[];
    };
    clientTransactionId: string;
    railBookingID: string;
    commercials: Commercials;
    booking_Status: BookingStatus;
    contactdetails: {
        customerMobileNumber: string;
        wsUserLogin: string;
    };
    userID: string;
    ownerID: string;
    refID: string;
    initiatedAt: string; // ISO date string
    chargedAmount: number;
    Error?: string;
    baseError?: string;
    RBTktres?: TicketReservation;
}

export interface Passenger {
    passengerAge: string;
    passengerBedrollChoice: string; // "true" | "false"
    passengerBerthChoice: string;
    passengerGender: 'M' | 'F';
    passengerIcardFlag: string;     // "true" | "false"
    passengerName: string;
    passengerNationality: string;
    passengerFoodChoice: string;
    passengerCardType: string;
    passengerCardNumber: string;
    psgnConcDOB: string;
    childBerthFlag: string;         // "true" | "false"
    _id: string;
}

export interface Commercials {
    TravelAgentFee: number;
    pgCharge: number;
    fixedCharges: number;
    pgChargepartner: number;
    sgst: number;
    cgst: number;
    igst: number;
    _id: string;
}

export interface Availability {
    availablityDate: string; // e.g., "21-8-2025"
}

export interface TicketReservation {
    reservationId: string;
    pnrNumber: string;
    psgnDtlList: TicketPassenger[];
    journeyDate: string; // ISO string
    boardingStn: string;
    journeyQuota: string;
}

export interface TicketPassenger {
    passengerSerialNumber: number;
    passengerName: string;
    passengerAge: number;
    passengerGender: 'M' | 'F';
    passengerBerthChoice: string;
    passengerIcardFlag: boolean;
    passengerNationality: string;
    fareChargedPercentage: number;
    validationFlag: string;
    bookingStatusIndex: number;
    bookingStatus: string;
    bookingCoachId: string;
    bookingBerthNo: number;
    bookingBerthCode: string;
    currentStatusIndex: number;
    currentStatus: string;
    currentCoachId: string;
    currentBerthNo: number;
    currentBerthCode: string;
    passengerNetFare: number;
    psgnwlType: number;
    dropWaitlistFlag: boolean;
    _id: string;
}
