export const PassengerStatus = (passenger: any, pnrStatus: any) => {
    const coachId = passenger?.currentCoachId
        ? " / " +
        (pnrStatus?.passengerList?.find(
            (pnr: any) => pnr?.passengerSerialNumber === passenger?.passengerSerialNumber.toString()
        )?.currentCoachId || passenger.currentCoachId) : "";

    const berthNo = passenger?.currentBerthNo
        ? " / " +
        (pnrStatus?.passengerList?.find(
            (pnr: any) =>
                pnr?.passengerSerialNumber === passenger?.passengerSerialNumber?.toString() &&
                pnr?.currentBerthNo !== "0"
        )?.currentBerthNo || passenger?.currentBerthNo)
        : "";

    const berthCode = passenger?.currentBerthCode
        ? " / " +
        (pnrStatus?.passengerList?.find(
            (pnr: any) => pnr.passengerSerialNumber === passenger?.passengerSerialNumber?.toString()
        )?.currentBerthCode || passenger.currentBerthCode)
        : "";
    return `${coachId}${berthNo}${berthCode}`;
};