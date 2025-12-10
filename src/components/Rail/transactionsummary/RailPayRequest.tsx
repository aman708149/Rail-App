export interface commercials {
    TravelAgentFee: number;
    pgCharge: number;
    fixedCharges: number;
    pgChargepartner: number;
    sgst: number;
    cgst: number;
    igst: number;
    _id: string;
}

interface GstDetails {
    pin: string;
    state: string;
    city: string;
    area: string;
    street: string;
    flat: string;
    nameOnGst: string;
    gstIn: string;
}

export interface RBrequest {
    gstDetails: GstDetails;
    gstNumber: string;
    mobileNumber: string;
    email: string;
    customerMobileNumber: string;
    agentDeviceId: string;
    masterId: string;
    cache: string;
    clusterFlag: string;
    enquiryType: string;
    ignoreChoiceIfWl: string;
    moreThanOneDay: string;
    wsUserLogin: string;
    onwardFlag: string;
    atasOpted: string;
    ticketType: string;
    reservationChoice: string;
    autoUpgradationSelected: string;
    travelInsuranceOpted: string;
    boardingStation: string;
    reservationMode: string;
    coachId: string;
    passengerList: {
        passengerAge: string;
        passengerBedrollChoice: string;
        passengerBerthChoice: string;
        passengerGender: string;
        passengerIcardFlag: string;
        passengerName: string;
        passengerNationality: string;
        passengerFoodChoice: string;
        passengerCardType: string;
        childBerthFlag: string;
        passengerCardNumber: string;
        psgnConcDOB: string;
        _id: string;
    }[];
    infantList: any[];
    _id: string;
}
export interface RBresponse {
    trainName: string;
    trainNo: string;
    from: string;
    to: string;
    enqClass: string;
    quota: string;
    distance: string;
    baseFare: string;
    reservationCharge: string;
    superfastCharge: string;
    fuelAmount: string;
    totalConcession: string;
    tatkalFare: string;
    serviceTax: string;
    otherCharge: string;
    cateringCharge: string;
    dynamicFare: string;
    totalFare: string;
    wpServiceCharge: string;
    wpServiceTax: string;
    travelInsuranceCharge: string;
    travelInsuranceServiceTax: string;
    insuredPsgnCount: string;
    nextEnqDate: string;
    serverId: string;
    timeStamp: string;
    otpAuthenticationFlag: string;
    totalCollectibleAmount: string;
    bkgCfg: {
        seniorCitizenApplicable: string;
        foodChoiceEnabled: string;
        validIdCardTypes: string[];
        applicableBerthTypes: string[];
        foodDetails: any[];
        bonafideCountryList: string[];
        idRequired: string;
        bedRollFlagEnabled: string;
        maxMasterListPsgn: string;
        maxPassengers: string;
        maxInfants: string;
        minNameLength: string;
        maxNameLength: string;
        srctznAge: string;
        srctnwAge: string;
        maxARPDays: string;
        maxRetentionDays: string;
        minPassengerAge: string;
        maxPassengerAge: string;
        maxChildAge: string;
        minIdCardLength: string;
        maxIdCardLength: string;
        minPassportLength: string;
        maxPassportLength: string;
        srctzTAge: string;
        lowerBerthApplicable: string;
        newTimeTable: string;
        childBerthMandatory: string;
        suvidhaTrain: string;
        specialTatkal: string;
        atasEnable: string;
        gatimaanTrain: string;
        travelInsuranceEnabled: string;
        travelInsuranceFareMsg: string;
        uidVerificationPsgnInputFlag: string;
        uidVerificationMasterListFlag: string;
        uidMandatoryFlag: string;
        gstDetailInputFlag: string;
        gstinPattern: string;
        forgoConcession: string;
        twoSSReleaseFlag: string;
        beyondArpBooking: string;
        acuralBooking: string;
        redemptionBooking: string;
        trainsiteId: string;
        pmfInputEnable: string;
        pmfInputMandatory: string;
        pmfInputMaxLength: string;
        captureAddress: string;
        _id: string;
    };
    avlDayList: {
        availablityDate: string;
        availablityStatus: string;
        reasonType: string;
        availablityType: string;
        currentBkgFlag: string;
        wlType: string;
        _id: string;
    }[];
    informationMessage: {
        message: string;
        popup: string;
        paramName: string;
        _id: string;
    }[];
    _id: string;
}

export enum ClassCodeEnum {
    '1A' = '1A',
    '2A' = '2A',
    '3A' = '3A',
    'FC' = 'FC',
    'CC' = 'CC',
    'SL' = 'SL',
    '2S' = '2S',
    '3E' = '3E',
    'EV' = 'EV',
    'VS' = 'VS',
    'EA' = 'EA',
    'EC' = 'EC',
    'GN' = 'GN',
};

export enum TimeTablePrintFlag {
    PRINT = 0,
    DO_NOT_PRINT = 1
}


export interface resvDetails {
    reservationId: string,
    reservationMode: string,
    transactionDate: string,
    noOfTicket: number,
    totalAmntRes: number,
    paymentType: string,
    refundStatusRes: string,
    userId: string,
    agentUserId: string,
    mobileNumber: string,
    reservationStatus: string,
    _id: string
}

export interface RBTktres {
    insuranceCompany: string;
    insuranceCompanyUrl: string;
    boardingStnName: string;
    resvnUptoStnName: string;
    taServiceCharge: string;
    serviceChargeTotal: number;
    gstDetailsDTO: any;
    fromStnName: any;
    reservationId: string;
    lapNumber: number;
    timeTableFlag: TimeTablePrintFlag;
    pnrNumber: string;
    departureTime: string;
    arrivalTime: string;
    reasonType: string;
    reasonIndex: number;
    informationMessage: string[];
    destArrvDate: string;
    bookingDate: string;
    numberOfChilds: number;
    numberOfAdults: number;
    trainNumber: string;
    fromStn: string;
    destStn: string;
    resvnUptoStn: string;
    journeyClass: ClassCodeEnum;
    journeyQuota: string;
    insuranceCharge: number;
    totalCollectibleAmount: number;
    psgnDtlList: {
        foodChoice: any;
        passengerSerialNumber: number;
        passengerName: string;
        passengerAge: number;
        passengerGender: string;
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
    }[];
    avlForVikalp: boolean;
    gstCharge: {
        invoiceNumber: any;
        gstinSuplier: any;
        suplierAddress: any;
        sacCode: any;
        taxableAmt: any;
        cgstRate: any;
        prsCgstCharge: any;
        sgstRate: any;
        prsSgstCharge: any;
        igstRate: any;
        prsIgstCharge: any;
        prsSuplierState: any;
        prsSuplierStateCode: string;
        totalPRSGst: number;
        irctcCgstCharge: number;
        irctcSgstCharge: number;
        irctcIgstCharge: number;
        irctcUgstCharge: number;
        totalIrctcGst: number;
        _id: string;
    };
    sai: boolean;
    journeyLap: number;
    sectorId: boolean;
    canSpouseFlag: boolean;
    mahakalFlag: boolean;
    mealChoiceEnable: boolean;
    complaintFlag: number;
    travelnsuranceRefundAmount: number;
    addOnOpted: boolean;
    multiLapFlag: boolean;
    mlUserId: number;
    mlReservationStatus: number;
    mlTransactionStatus: number;
    mlJourneyType: number;
    timeDiff: number;
    mlTimeDiff: number;
    totalRefundAmount: number;
    trainName: string;
    distance: number;
    boardingStn: string;
    boardingDate: string;
    journeyDate: string;
    trainOwner: number;
    reservationCharge: number;
    superfastCharge: number;
    fuelAmount: number;
    tatkalFare: number;
    serviceTax: number;
    cateringCharge: number;
    totalFare: number;
    wpServiceCharge: number;
    wpServiceTax: number;
    insuredPsgnCount: number;
    serverId: string;
    timeStamp: string;
    otpAuthenticationFlag: number;
    metroServiceOpted: boolean;
    eligibleForMetro: boolean;
    travelProtectOpted: boolean;
    dmrcRefundStatusId: number;
    dmrcRefundAmount: number;
    dmrcCancellationCharge: number;
    dmrcCancellationId: number;
    dmrcBooking: boolean;
    postMealRefundStatusId: number;
    postMealRefundAmount: number;
    postMealCancellationCharge: number;
    postMealComplaintFlag: number;
    postMealOpt: boolean;
    mealCancellationId: number;
    _id: string;
    cancellationDetails: any[];
    refundprocessDetails: any[];
    resvDetails?: resvDetails
}
export interface RailPayRequest {
    _id: string;
    RBrequest: RBrequest;
    RBresponse: RBresponse;
    clientTransactionId: string;
    railBookingID: string;
    commercials: commercials;
    status: string;
    booking_Status: string;
    contactdetails: {
        mobileNumber: string;
        email: string;
        customerMobileNumber: string;
        wsUserLogin: string;
        _id: string;
    };
    RouteDetails: {
        distance: number;
        halt: number;
        fstationName: string;
        fdepartureTime: string;
        tostationName: string;
        toarrivalTime: string;
        duration: string;
        ArrivalDate: string;
        _id: string;
    };
    userID: string;
    ownerID: string;
    refID: string;
    createdAt: string;
    __v: number;
    initiatedAt: string;
    updatedAt: string;
    orderID: string;
    RBTktres: RBTktres;
    journalID: number;
}
