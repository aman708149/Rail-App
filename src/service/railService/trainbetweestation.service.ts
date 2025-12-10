import axiosInstance from "@/src/utils/axios"

const baseUrl = process.env.EXPO_PUBLIC_RAIL_APP_BASE_URL
export const GetTrainBetWeenStationService = async (fromStation: string, toStation: string, date: string, source: string) => {
    return axiosInstance.get(`${baseUrl}/trainbetweenstation/trains-with-availability/${fromStation}/${toStation}/${date}/${source}`)
}

export const GetSixDaysAvailabilityService = async (
    trainNumber: string, jDate: string, frmStn: string, toStn: string, jClass: string, jQuota: string, source: string, runningDays: string
) => {
    return axiosInstance.post(`${baseUrl}/trainavailability/${trainNumber}/${jDate}/${frmStn}/${toStn}/${jClass}/${jQuota}/N/${source}/6/${runningDays}`)
}

export const GetAllQuotaAvailabilityService = async (
    trainNumber: string, jDate: string, frmStn: string, toStn: string, jClass: string, quotas: string[], source: string, runningDays: string
) => {
    return axiosInstance.post(`${baseUrl}/trainbetweenstation/trains-with-availability/allquota/${trainNumber}/${jDate}/${frmStn}/${toStn}/${jClass}/all/${source}/6/${runningDays}`, { quotas })
}