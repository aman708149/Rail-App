import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    useColorScheme,
    Pressable,
    Platform,
    UIManager,
    Alert,
    Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { GetVerifiedContactservice, GetVerifiedEmailervice, pincodeService, Railavconfig, RailFareCalculationService, railformbuilder, RefreshRailProfileService, SendOTPForEmailVerification, SendOTPForMobileVerification, VerifyOTPAndSaveEmail, VerifyOTPAndSaveMobile } from '@/src/service/apiservice';
import convertDateIRCTCformate from '@/src/utils/convertDateIRCTCformate';
import TrainScheduleError from '@/src/components/Rail/bookingDetails/TrainScheduleError';
// import "../../../global.css";
import PassengerInputRow from '@/src/components/Rail/bookingDetails/PassengerInputRow';
import { Icon, List } from "react-native-paper";
import ReusableAccordion from '@/src/components/Accordian/ReusableAccordion';
import { AccordionProps } from '@/src/components/Accordian/AccordionProps';
import { Picker } from '@react-native-picker/picker';
import FoodChoiceCheckbox from '@/src/components/Rail/bookingDetails/FoodChoiceCheckbox';
import { TrainOwnerEnum } from '@/src/components/Rail/trainroute';
import { DateTime } from 'luxon';
import ContactDetailsAcordian from '@/src/components/Accordian/ContactDetailsAcordian';
import { showMessage } from '@/src/utils/showMessage';
import DigitalClockwithHHMMSSA from '@/src/components/Rail/bookingDetails/DigitalClockwithHHMMSSA';
import { router } from 'expo-router';
import { calculateAge } from '@/src/utils/calculateAge';
import { capitalizeWords } from '@/src/utils/capitalizeWords';
import { formatDateWithDay } from '@/src/utils/DateFormate/Dateformate';
import CustomModal from '@/src/components/Modal/CustomModal';

interface BoardingStation {
    stnNameCode: string;
    stationCode: string;
    stationName: string;
    arrivalTime: string;
    departureTime: string;
    boardingDate: string;
    routeNumber?: string;
    haltTime?: string;
    distance?: number;
    dayCount?: number;
    stnSerialNumber?: number;
    boardingDisabled?: boolean;
    _id?: string;
}

interface PassengerType {
    name: string;
    age: string;
    gender: string;
    berth: string;
    nationality: string;
    meal: string;
    optberth: boolean;
    bedroll: string;
    dob: string;
    idCardType: string;
    idNumber: string;
    isChild: boolean;
    _id: string;
}



export default function BookingDetails() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiErrorComponent, setApiErrorComponent] = useState<any>(null);

    // Form States
    const [selectedTDate, setSelectedTDate] = useState("");
    const [mobile, setMobile] = useState("");
    const [customerMobileNumber, setCustomerMobileNumber] = useState("");
    const [selectedBoardingPoint, setSelectedBoardingPoint] = useState("");
    const [preferredCoach, setPreferredCoach] = useState("");

    // API Data States
    const [railavconfigform, setRailavconfigform] = useState<any>(null);
    const [railprofile, setRailprofile] = useState<any>(null);
    const [dontWantFood, setDontWantFood] = useState(false);
    const [trainRoute, setTrainroute] = useState<any[]>([]);
    const [countryList, setCountryList] = useState<any[]>([]);
    const [trainTimings, setTrainTimings] = useState<any>({});
    // const [boardingStationList, setBoardingStationList] = useState<any[]>([]);
    const [trainOwner, setTrainOwner] = useState("");
    const [wsUserLogin, setWsUserLogin] = useState<any>(null);
    const [isWaitingTrain, setIswaitingtrain] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [email, setEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState<boolean>(false);
    const [mobileVerified, setMobileVerified] = useState<boolean>(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [showMobileOtpInput, setShowMobileOtpInput] = useState(false);
    const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
    const [railFare, setRailFare] = useState<any>();

    // Checkbox States
    const [autoUpgrade, setAutoUpgrade] = useState(false);
    const [bookIfConfirm, setBookIfConfirm] = useState(false);
    const [travelInsurance, setTravelInsurance] = useState(false);
    const [choice, setChoice] = useState<string>('None');
    const [refresh, setRefresh] = useState<boolean>(false);
    const [continueloading, setContinueloading] = useState(false);
    const [bookingModeModel, setBookingModeModel] = useState<boolean>(false);
    const [seniorCitizenModal, setSeniorCitizenModal] = useState(false);
    const [extrailreqId, setExtrailreqId] = useState<string>('');

    const [boardingStationList, setBoardingStationList] = useState<BoardingStation[]>([]);
    const [selectedBoarding, setSelectedBoarding] = useState<BoardingStation | null>(null);
    const [boardingDropdownOpen, setBoardingDropdownOpen] = useState(false);
    const [numberOfPassengers, setNumberOfPassengers] = useState(1);
    const nameRefs = useRef<any[]>([]);
    const [selectedPassengerIndex, setSelectedPassengerIndex] = useState<any>();
    const [isRemoveConfirmModalVisible, setIsRemoveConfirmModalVisible] =
        useState(false);
    const [activeid, setActiveid] = useState<string>('1');


    // ----------------- INFANT STATES -----------------
    const [infants, setInfants] = useState([
        { name: "", age: "", gender: "", _id: "" }
    ]); // 👈 default infant

    const [activeAccordionId, setActiveAccordionId] = useState<string | string[]>("");

    const [otpmodal, setOtpmodal] = useState(false);
    const [otp, setOtp] = useState('');
    const [emailotpmodal, setEmailOtpmodal] = useState(false);

    const [gstNumber, setGstNumber] = useState("");
    const [gstName, setGstName] = useState("");
    const [gstAddress, setGstAddress] = useState("");
    const [street, setStreet] = useState("");
    const [area, setArea] = useState("");
    const [pincode, setPincode] = useState("");
    const [stateName, setStateName] = useState("");
    const [city, setCity] = useState("");


    // For accordion UI



    const RailFareCalculation = async (classname: string, fare: number) => {
        try {
            const response = await RailFareCalculationService(classname, fare);
            setRailFare(response.data);
        } catch (error) {
            console.error('Fare calculation error:', error);
        }
    };

    const fetchRailFormBuilder = async (
        trainNo: string,
        selectedTDate: string,
        Sfrom: string,
        Sto: string,
        JClass: string,
        JQuota: string,
        paymentEnqFlag: string,
        source: string
    ) => {
        try {
            const jDate = await convertDateIRCTCformate(selectedTDate);
            const response = await railformbuilder(
                trainNo,
                jDate,
                Sfrom,
                Sto,
                JClass,
                JQuota,
                paymentEnqFlag,
                source
            );

            if (!response || !response.data) {
                return {
                    error: `Failed to fetch data: ${response?.statusText || "Unknown error"}`,
                };
            }

            return response.data;
        } catch (err: any) {
            console.error("Fetch Rail Formbuilder Error:", err.message);
            return { error: err.message || "Something went wrong" };
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const storedData = await AsyncStorage.getItem("searchInitDataAll");

            if (!storedData) {
                setLoading(false);
                return;
            }

            const parsedData = JSON.parse(storedData);
            const {
                trainNo,
                date,
                from,
                to,
                enqClass,
                quota,
                mobileNumber,
                arrivalTime,
                departureTime
            } = parsedData;

            if (trainNo && date && from && to && enqClass && quota) {
                setSelectedTDate(date);
                setMobile(mobileNumber);
                setCustomerMobileNumber(mobileNumber);
                setSelectedBoardingPoint(from);

                try {
                    const railResult = await fetchRailFormBuilder(
                        trainNo,
                        date,
                        from,
                        to,
                        enqClass,
                        quota,
                        "N",
                        "cache"
                    );

                    if (!railResult) return;
                    if (railResult.error) {
                        setApiError(railResult.error);
                        return;
                    }

                    // Train Timing Change Validation
                    if (
                        departureTime &&
                        arrivalTime &&
                        (
                            railResult?.trainTimings?.toarrivalTime !== arrivalTime ||
                            railResult?.trainTimings?.fdepartureTime !== departureTime
                        )
                    ) {
                        setApiErrorComponent(
                            <TrainScheduleError
                                oldDeparture={departureTime}
                                newDeparture={railResult?.trainTimings?.fdepartureTime}
                                oldArrival={arrivalTime}
                                newArrival={railResult?.trainTimings?.toarrivalTime}
                            />
                        );
                        return;
                    }

                    // Set All States
                    setRailavconfigform(railResult.railavconfigform[0]);
                    const stations = railResult.boardingStationList?.BoardingStation || [];

                    setBoardingStationList(stations);

                    if (stations.length > 0) {
                        setSelectedBoarding(stations[0]);
                    }

                    setRailprofile(railResult.railprofile);
                    setDontWantFood(
                        railResult?.railavconfigform[0]?.bkgCfg.foodChoiceEnabled === "true" &&
                        railResult?.railprofile?.ticketConfigs?.cateringOption === false
                    );
                    setTrainroute(railResult.trainroute || []);
                    setCountryList(railResult.countryList || []);
                    setTrainTimings(railResult.trainTimings || {});
                    setBoardingStationList(
                        railResult.boardingStationList?.BoardingStation || []
                    );
                    setTrainOwner(railResult?.boardingStationList?.trainOwner);
                    setWsUserLogin(railResult.wsUserLogin);

                    const status =
                        railResult?.railavconfigform[0]?.avlDayList[0]?.availablityStatus?.toLowerCase();
                    const statusAfter = status?.split("/")[1];
                    const isWaiting = status?.includes("w") && !statusAfter?.includes("available");
                    setIswaitingtrain(isWaiting);

                    if (railResult?.email?.length > 0)
                        setEmail(railResult.email);

                    const fare =
                        Number(railResult.railavconfigform[0].totalFare) +
                        Number(railResult.railavconfigform[0].wpServiceTax) +
                        Number(railResult.railavconfigform[0].wpServiceCharge);

                    RailFareCalculation(enqClass, fare);

                    const shouldConfirm =
                        railResult?.railprofile?.ticketConfigs?.TQBookifConfirm &&
                        railResult?.railavconfigform[0]?.quota === "TQ" &&
                        !isWaiting;

                    setConfirm(shouldConfirm);
                    setBookIfConfirm(shouldConfirm);
                    setTravelInsurance(
                        railResult?.railavconfigform[0]?.bkgCfg?.travelInsuranceEnabled === "true"
                    );

                } catch (error: any) {
                    setApiError(
                        error?.message || "An error occurred while fetching data."
                    );
                }
            }
        } catch (e) {
            console.log("LOAD ERROR:", e);
        } finally {
            setLoading(false);
        }
    };


    // const parseBackendDate = (dateStr: any) => {
    //     if (!dateStr) return null;

    //     // backend format = "DD-MM-YYYY"
    //     const [dd, mm, yyyy] = dateStr.split("-");

    //     return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    // };

    const parseBackendDate = (dateStr: any) => {
        if (!dateStr) return null;

        // Try ISO/normal parsing first
        const isoParsed = new Date(dateStr);
        if (!isNaN(isoParsed.getTime())) {
            return isoParsed;
        }

        // Try DD-MM-YYYY format
        if (dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts.length === 3) {
                const [dd, mm, yyyy] = parts;
                const d = new Date(`${yyyy}-${mm}-${dd}`);
                if (!isNaN(d.getTime())) return d;
            }
        }

        return null;
    };



    // Format date helper
    const formatDate = (dateStr: any) => {
        const date = parseBackendDate(dateStr);
        if (!date) return '';

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} at ${trainTimings?.fdepartureTime || ''}`;
    };

    const formatArrivalDate = (dateStr: any) => {
        const date = parseBackendDate(dateStr);
        if (!date) return '';

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} at ${trainTimings?.toarrivalTime || ''}`;
    };

    const defaultPassenger = () => ({
        name: '',
        age: '',
        gender: '',
        berth: '',
        nationality: 'IN',
        meal:
            (railavconfigform?.bkgCfg.foodChoiceEnabled == 'true' && railprofile?.ticketConfigs?.cateringOption === true)
                ? railavconfigform?.bkgCfg.foodDetails[0]
                : '',
        optberth: true,
        bedroll: '',
        dob: '',
        idCardType: '',
        idNumber: '',
        isChild: false,
        _id: '',
        psgnConcDOB: "",
    });

    const HandleRefreshProfile = async () => {
        try {
            const response = await RefreshRailProfileService();  // response = data only
            console.log("PROFILE REFRESH RESPONSE:", response);

            if (response?.data?.status === true) {
                setRefresh(prev => !prev);
                showMessage("Success", "Profile refreshed successfully!");
            } else {
                showMessage("Info", "No changes found.");
            }
        } catch (error) {
            showMessage("Error", "Failed to refresh profile");
        }
    };


    const createPassengerArray = (numPassengers: any) => {
        const passengers = [];
        for (let i = 0; i < numPassengers; i++) {
            passengers.push({ ...defaultPassenger(), isChild: false });
        }
        return passengers;
    };

    const [passengers, setPassengers] = useState(() => createPassengerArray(numberOfPassengers));


    const DOBformateYYYYDDMM = (dob: string) => {
        if (!dob) return "";
        const d = new Date(dob);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}${mm}${dd}`;
    };

    const calculateAgeByDate = (dob: string) => {
        const birthday = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const m = today.getMonth() - birthday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
        return age;
    };



    function countBerthType(berthType: string) {
        return passengers.reduce(
            (count, passenger) => count + (passenger.berth === berthType ? 1 : 0),
            0
        );
    }

    const addPassengerList = () => {
        const maxPassengers = parseInt(
            railavconfigform?.bkgCfg?.maxPassengers ?? "0"
        );

        if (numberOfPassengers < maxPassengers) {
            const newIndex = numberOfPassengers;

            // Increase count
            setNumberOfPassengers((prev) => prev + 1);

            // Add new passenger
            setPassengers((prev) => [
                ...prev,
                { ...defaultPassenger(), isChild: false },
            ]);

            // Open newly added accordion
            setActiveAccordionId(`adult-${newIndex}`);

            // Focus the new passenger name input (React Native way)
            setTimeout(() => {
                nameRefs.current[newIndex]?.focus();
            }, 200);
        } else {
            showMessage(
                "Limit Reached",
                `Maximum ${railavconfigform?.bkgCfg?.maxPassengers} passengers allowed`
            );
        }
    };



    const handlePassengerChange = (
        index: number,
        field: keyof PassengerType,
        value: string | number,
    ) => {
        // setPassengers(prev =>
        //     prev.map((p, i) =>
        //         i === index ? { ...p, [field]: String(value) } : p  // ALWAYS STRING
        //     )
        // );

        {
            setPassengers(prev =>
                prev.map((p, i) => {
                    if (i !== index) return p;

                    const updated = { ...p, [field]: String(value) };

                    // ⭐ CRITICAL FIX: MAP dob TO psgnConcDOB
                    if (field === "dob") {
                        updated.psgnConcDOB = String(value);
                    }

                    return updated;
                })
            );
        };
    }


    const handlePassengerBlur = (index: number, updatedData: any) => {
        setPassengers(prev =>
            prev.map((p, i) =>
                i === index ? { ...p, ...updatedData } : p
            )
        );
    };



    // if (Platform.OS === "android") {
    //     UIManager.setLayoutAnimationEnabledExperimental &&
    //         UIManager.setLayoutAnimationEnabledExperimental(true);
    // }

    // 🔥 FIX WARNING – SAFE FOR OLD RN & NEW FABRIC ARCHITECTURE
    useEffect(() => {
        if (
            Platform.OS === 'android' &&
            UIManager.setLayoutAnimationEnabledExperimental
        ) {
            try {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            } catch (e) {
                console.log('LayoutAnimation not supported:', e);
            }
        }
    }, []);


    interface RNAccordionProps
        extends AccordionProps {
        activeId?: string | string[];
        stayOpen?: boolean;
        onToggle: (id: string) => void;
    }



    const handleToggleAccordion = (id: string) => {
        setActiveAccordionId((prev) => (prev === id ? "" : id));
    };

    const handleInfantChange = (index: number, field: string, value: string) => {
        const maxLen = railavconfigform?.bkgCfg?.maxNameLength || 16;
        const nameRegex = /^[A-Za-z ]*$/;

        if (field === "name") {
            // Format name: capitalize each word
            const formattedName = value
                .toLowerCase()
                .split(" ")
                .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
                .join(" ");

            // Disallow starting with space OR double spaces
            const invalidSpaces = value.startsWith(" ") || value.includes("  ");

            // Basic validation
            if (nameRegex.test(formattedName) && !invalidSpaces) {
                if (formattedName.length <= maxLen) {
                    // Normal update
                    setInfants((prev) =>
                        prev.map((infant, i) =>
                            i === index ? { ...infant, name: formattedName } : infant
                        )
                    );
                } else {
                    // Force trim to max allowed
                    const trimmed = formattedName.substring(0, maxLen);

                    setInfants((prev) =>
                        prev.map((infant, i) =>
                            i === index ? { ...infant, name: trimmed } : infant
                        )
                    );

                    Alert.alert("Name too long", `Name should be maximum ${maxLen} characters`);
                }
            }

            return;
        }

        // ---------------------------
        // For AGE / GENDER / Any other field
        // ---------------------------
        setInfants((prev) =>
            prev.map((infant, i) =>
                i === index ? { ...infant, [field]: value } : infant
            )
        );
    };

    // ➤ ADD INFANT WITHOUT BERTH
    const addInfantList = () => {
        const maxInfants = parseInt(railavconfigform?.bkgCfg?.maxInfants ?? "0");

        if (infants.length < maxInfants) {
            const newInfant = { name: "", age: "", gender: "", _id: "" };

            setInfants((prevInfants) => {
                const updatedInfants = [...prevInfants, newInfant];

                // Open last accordion
                setActiveAccordionId(`infant-passenger-${updatedInfants.length}`);

                return updatedInfants;
            });
        } else {
            Alert.alert(
                "Limit Reached",
                `Maximum ${railavconfigform?.bkgCfg?.maxInfants} infants allowed`
            );
        }
    };

    // ➤ REMOVE INFANT
    const removeInfantList = (index: number) => {
        setInfants((prevInfants) => {
            if (prevInfants.length === 1) {
                return [{ name: "", age: "", gender: "", _id: "" }];
            }
            return prevInfants.filter((_, i) => i !== index);
        });
    };


    const generateinfantAccordians = () => {
        return infants.map((infant, index) => ({
            id: `infant-passenger-${index + 1}`,

            header: (
                <View className="flex-row justify-between items-center w-full">
                    <Text className="text-base text-gray-800 dark:text-gray-200 flex-1">
                        {infant.name || infant.age || infant.gender
                            ? `${infant.name ? infant.name + " | " : ""}${infant.age ? infant.age + " | " : ""}${infant.gender || ""}`
                            : `Infant Without Berth ${index + 1}`}
                    </Text>

                    <View className="flex-row items-center gap-4 mr-2">
                        {/* Green Tick */}
                        {(infant.name && infant.age && infant.gender) ? (
                            <MaterialIcons name="check-circle" size={20} color="green" />
                        ) : null}

                        {/* DELETE INFANT */}
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                removeInfantList(index);   // 👈 call here
                            }}
                        >
                            <MaterialIcons name="delete" size={22} color="red" />
                        </Pressable>
                    </View>
                </View>
            ),

            body: (
                <View className="flex flex-col gap-4">
                    {/* NAME */}
                    <View>
                        <Text className="text-gray-700 dark:text-gray-300 mb-1">Name</Text>
                        <TextInput
                            placeholder="Enter Name"
                            value={infant.name}
                            onChangeText={(text) => handleInfantChange(index, "name", text)}
                            className="border px-3 py-2 rounded border-gray-400 dark:border-gray-700 dark:text-white"
                        />
                    </View>

                    {/* AGE */}
                    <View>
                        <Text className="text-gray-700 dark:text-gray-300 mb-1">Age</Text>
                        <View className="border rounded border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-900">
                            <Picker
                                selectedValue={infant.age}
                                onValueChange={(value) => handleInfantChange(index, "age", value)}
                            >
                                <Picker.Item label="Select Age" value="" />
                                <Picker.Item label="1 Year" value="1" />
                                <Picker.Item label="2 Years" value="2" />
                                <Picker.Item label="3 Years" value="3" />
                                <Picker.Item label="4 Years" value="4" />
                            </Picker>
                        </View>
                    </View>

                    {/* GENDER */}
                    <View>
                        <Text className="text-gray-700 dark:text-gray-300 mb-1">Gender</Text>
                        <View className="border rounded border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-900">
                            <Picker
                                selectedValue={infant.gender}
                                onValueChange={(value) => handleInfantChange(index, "gender", value)}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="M" />
                                <Picker.Item label="Female" value="F" />
                            </Picker>
                        </View>
                    </View>
                </View>
            ),
        }));
    };

    const [infantAccordions, setInfantAccordions] = useState(generateinfantAccordians());
    useEffect(() => {
        setInfantAccordions(generateinfantAccordians());
    }, [infants]);

    const performRemovePassenger = (index: number, isChild = false) => {
        setPassengers((prev) => prev.filter((_, i) => i !== index));
        setNumberOfPassengers((prev) => prev - 1);
    };

    const removePassenger = (index: number, isChild = false) => {
        console.log("Remove clicked for:", index);  // 🟢 add this
        const passenger = passengers[index];

        if (passenger && passenger.name) {
            setSelectedPassengerIndex(index);
            setIsRemoveConfirmModalVisible(true);
        } else {
            performRemovePassenger(index, isChild);
        }
    };

    // passenger form Accordian
    const generatePassengerAccordions = () => {
        return passengers.map((P, i) => {
            const applicableBerthTypes =
                railavconfigform?.bkgCfg?.applicableBerthTypes || [];
            const foodChoiceEnabled =
                railavconfigform?.bkgCfg?.foodChoiceEnabled || "";
            const validIdCardTypes =
                railavconfigform?.bkgCfg?.validIdCardTypes || [];
            const bonafideCountryList =
                railavconfigform?.bkgCfg?.bonafideCountryList || [];
            const bedRollFlagEnabled =
                railavconfigform?.bkgCfg?.bedRollFlagEnabled || "";
            const foodDetails = railavconfigform?.bkgCfg?.foodDetails || [];
            const CateringDefaultOption =
                railprofile?.ticketConfigs?.cateringOption;

            const passengerValidation = {
                maxNameLength: railavconfigform?.bkgCfg?.maxNameLength || "",
                minNameLength: railavconfigform?.bkgCfg?.minNameLength || "",
                minPassengerAge: railavconfigform?.bkgCfg?.minPassengerAge || "",
                maxPassengerAge: railavconfigform?.bkgCfg?.maxPassengerAge || "",
                maxChildAge: railavconfigform?.bkgCfg?.maxChildAge || "",
                childBerthMandatory: railavconfigform?.bkgCfg?.childBerthMandatory || "",
                srctznAge: railavconfigform?.bkgCfg?.srctznAge || "",
                srctnwAge: railavconfigform?.bkgCfg?.srctnwAge || "",
            };

            const headerText =
                `${P.name ? P.name.slice(0, 16) : `Passenger ${i + 1}`}` +
                `${P.age ? ` | ${P.age}` : ""}` +
                `${P.gender ? ` | ${P.gender}` : ""}` +
                `${P.berth ? ` | ${P.berth}` : " | NP"}` +
                `${!P.optberth ? ` | NOSB` : ""}` +
                `${P.meal ? ` | ${P.meal}` : ""}` +
                `${P.nationality ? ` | ${P.nationality}` : ""}` +
                `${P.dob && P.nationality !== "IN" ? ` | ${P.dob}` : ""}` +
                `${P.idCardType ? ` | ${P.idCardType}` : ""}` +
                `${P.idNumber ? ` | ${P.idNumber}` : ""}`;

            return {
                id: `adult-${i}`,

                // -------------------------------
                // ACCORDION HEADER (ReactNode)
                // -------------------------------
                header: (
                    <View className="flex-row justify-between items-center w-full">
                        {/* LEFT SIDE - Passenger Text */}
                        <Text className="text-base text-white font-semibold flex-1">
                            {headerText}
                        </Text>

                        {/* RIGHT SIDE - Icons */}
                        <View className="flex-row items-center gap-4">

                            {/* GREEN TICK ✔ (if data complete) */}
                            {P.name && P.age && P.gender ? (
                                <MaterialIcons name="done-all" size={20} color="green" />
                            ) : null}

                            {/* SAVE ICON */}
                            <Pressable
                            // onPress={(e) => {
                            //     e.stopPropagation(); // don't close accordion
                            //     SavePassenger(
                            //         P.name,
                            //         P.age,
                            //         P.gender,
                            //         P.nationality,
                            //         P.idCardType,
                            //         P.idNumber,
                            //         P.berth,
                            //         P.meal
                            //     );
                            // }}
                            >
                                {/* <MaterialIcons name="save" size={22} color="#22c55e" /> */}
                            </Pressable>

                            {/* REMOVE ICON  */}
                            <Pressable className='mr-2'
                                onPress={(e) => {
                                    e.stopPropagation(); // don't close accordion
                                    removePassenger(i, false); // 👈 same logic from Next.js version
                                }}
                            >
                                <MaterialIcons name="delete" size={22} color="red" />
                            </Pressable>
                        </View>
                    </View>
                ),

                // -------------------------------
                // ACCORDION BODY (ReactNode)
                // -------------------------------
                body: (
                    <PassengerInputRow
                        key={`adult-row-${i}`}
                        name_id={`adult-passenger-${i + 1}-name`}
                        data={{
                            name: P?.name || "",
                            age: P?.age || "",
                            gender: P?.gender || "",
                            meal: P?.meal,
                            berth: P?.berth || "",
                            nationality: P?.nationality || "",
                            idCardType: P?.idCardType || "",
                            idNumber: P?.idNumber || "",
                            bedroll: P?.bedroll || "",
                            optberth: P?.optberth,
                            dob: P?.dob || "",
                        }}
                        number={i + 1}
                        isChild={false}
                        lowerberthCount={countBerthType("LB")}
                        middleberthCount={countBerthType("MB")}
                        upperberthCount={countBerthType("UB")}
                        sideupperberthCount={countBerthType("SU")}
                        sideLowerberthCount={countBerthType("SL")}
                        sideMiddleberthCount={countBerthType("SM")}
                        applicableBerthTypes={applicableBerthTypes}
                        onChange={(field, value) =>
                            handlePassengerChange(i, field as keyof PassengerType, String(value))
                        }
                        foodChoice={foodChoiceEnabled}
                        validIdCardTypes={validIdCardTypes}
                        bonafideCountryList={bonafideCountryList}
                        bedRollFlagEnabled={bedRollFlagEnabled}
                        foodDetails={dontWantFood ? ["D"] : foodDetails}
                        passengerValidation={passengerValidation}
                        CateringDefaultOption={CateringDefaultOption}
                        onBlur={(updated) => handlePassengerBlur(i, updated)}
                        Quota={railavconfigform?.quota}
                        countryLists={countryList}
                    />
                ),
            };
        });
    };

    const [passengerAccordions, setPassengerAccordions] = useState(
        generatePassengerAccordions()
    );

    useEffect(() => {
        setPassengerAccordions(generatePassengerAccordions());
    }, [passengers, railavconfigform]);


    // AccordionItems like Contact, gst, reservition type 

    // BookingDetails.tsx  (ONLY ONE PAGE)

    // 🟠 TOGGLE HANDLER
    const HandelContactAcordian = (id: string) => {
        setActiveid((prevId) => (prevId === id ? '' : id));
    };


    const handelvalidationContact = (value: string, type: string) => {
        if (type === "mobile") {
            // Allow only numeric & up to 10 digits
            const regex = /^[0-9]*$/;

            if (regex.test(value) && value.length <= 10) {
                setMobile(value);
            } else {
                Alert.alert("Invalid Input", "Only numeric values allowed (max 10 digits)");
            }
        }

        if (type === "email") {
            setEmail(value);
        }
    };


    const handelvalidationContactonBlur = (value: string, type: string) => {
        if (type === "email") {
            // only check if value is not empty
            if (value.trim() !== "") {
                const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

                if (emailRegex.test(value)) {
                    setEmail(value.trim());
                } else {
                    Alert.alert("Invalid Email", "Please enter a valid email address.");
                    setEmail(""); // Optional clear
                }
            }
        }

        if (type === "mobile") {
            if (value.trim() !== "") {
                // Must start with 6, 7, 8, or 9 → total 10 digits
                const mobileRegex = /^[6789]\d{9}$/;

                if (mobileRegex.test(value)) {
                    setMobile(value.trim());
                } else {
                    Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit number starting with 6, 7, 8, or 9.");
                }
            }
        }
    };

    // 🔹 Auto Verify Mobile when length > 9
    useEffect(() => {
        if (mobile && mobile.length >= 10) {
            GetVerifiedContact();
        }
    }, [mobile]);

    // 🔹 Auto Verify Email when full input entered
    useEffect(() => {
        if (email && email.includes("@") && email.includes(".")) {
            GetVerifiedEmail();
        }
    }, [email]);

    // --------------------- API: Verify Contact ---------------------
    const GetVerifiedContact = async () => {
        try {
            const response = await GetVerifiedContactservice(mobile);

            if (response?.status === 200 || response?.status === 201) {
                setMobileVerified(response?.data?.mobile === mobile);
            }
        } catch (error) {
            setMobileVerified(false);
            showMessage("Error", "Unable to verify mobile");
        }
    };


    // --------------------- API: Verify Email ---------------------
    const GetVerifiedEmail = async () => {
        try {
            const response = await GetVerifiedEmailervice(email);

            if (response?.status === 200 || response?.status === 201) {
                setEmailVerified(response?.data?.email === email);
            }
        } catch (error) {
            setEmailVerified(false);
            showMessage("Error", "Unable to verify email");
        }
    };


    // --------------------- SEND OTP (Mobile) ---------------------
    const sendOtp = async () => {
        try {
            const response = await SendOTPForMobileVerification(mobile);

            if (response?.message === 'OTP sent successfully') {
                showMessage("Success", response?.data?.message || "OTP sent successfully");
                setShowOtpInput(true);
            } else {
                showMessage("Error", response?.data?.message || "Failed to send OTP");
                setShowOtpInput(false);
            }
        } catch (error: any) {
            showMessage("Error", error?.response?.data?.error || "Something went wrong");
        }
    };


    // --------------------- VERIFY MOBILE OTP ---------------------
    const verifiyOTP = async () => {
        try {
            const response = await VerifyOTPAndSaveMobile(mobile, otp);

            if (response?.status === 200 || response?.status === 201) {
                showMessage("Success", "Mobile number verified successfully");
                setOtpmodal(false);
                setShowOtpInput(false);
                GetVerifiedContact();
            } else {
                showMessage("Error", response?.data?.message || "OTP verification failed");
            }
        } catch (error: any) {
            showMessage("Error", error?.response?.data?.error || "Something went wrong. Try again.");
        }
    };


    // --------------------- VERIFY EMAIL OTP ---------------------
    const verifyOTPEmail = async () => {
        if (!otp.trim()) {
            showMessage("Validation", "Please enter OTP first.");
            return;
        }

        try {
            const response = await VerifyOTPAndSaveEmail(email, otp);

            if ((response?.status === 200 || response?.status === 201) && !response?.data?.message) {
                showMessage("Success", "Email verified successfully");
                setOtpmodal(false);
                setEmailOtpmodal(false);
                setShowOtpInput(false);
                GetVerifiedEmail();
            } else {
                showMessage("Error", response?.data?.message || "Invalid OTP");
            }
        } catch (error: any) {
            showMessage("Error", error?.response?.data?.error || "Something went wrong");
        }
    };


    // --------------------- SEND OTP (Email) ---------------------
    const sendOtpOnEmail = async () => {
        try {
            const response = await SendOTPForEmailVerification(email);
            if (response?.status === 200 || response?.status === 201) {
                showMessage("Success", "OTP sent successfully");
                setShowEmailOtpInput(true);   // use only email state ✔
            }
        } catch (error) {
            showMessage("Error", "Failed to send OTP");
        }
    };


    const toggleEmailOtpModal = () => {
        setEmailOtpmodal(!emailotpmodal);
        setShowEmailOtpInput(false);  // reset ✔
        setOtp("");                   // reset ✔
    };

    const GsTDetails = (type: string, value: string) => {
        if (type === "gstno") setGstNumber(value);

        if (type === "gstName" && /^[A-Za-z ]*$/.test(value)) {
            setGstName(value);
        }

        if (["gstadress", "street", "area"].includes(type)) {
            if (/^[A-Za-z0-9 ]*$/.test(value)) {
                if (type === "gstadress") setGstAddress(value);
                if (type === "street") setStreet(value);
                if (type === "area") setArea(value);
            }
        }

        if (type === "pincode") {
            setPincode(value);
        }
    };

    const handelGstValidation = async (type: string, value: string) => {

        if (type === "gstno") {
            const GstPattern =
                /^([0]{1}[1-9]{1}|[1]{1}[0-9]{1}|[2]{1}[0-7]{1}|[2]{1}[9]{1}|[3]{1}[0-8]{1}|96|97|99)[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[a-zA-Z0-9]{1}[A-Za-z]{1}[a-zA-Z0-9]{1}$/;

            if (GstPattern.test(value.toLowerCase())) {
                setGstNumber(value.toUpperCase());
            } else {
                showMessage("Invalid GST Number", "Please enter a valid GST number");
                return;
            }
        }

        if (type === "pincode") {
            if (value.length === 6 && /^\d*$/.test(value)) {
                try {
                    const response = await pincodeService(value);
                    setStateName(response?.state || "");
                    setCity(response?.cityList?.[0] || "");

                } catch (error) {
                    Alert.alert("Error", "Invalid Pincode or Server Issue");
                }
            }
        }
    };


    const ClearGSTField = () => {
        setGstNumber("");
        setGstName("");
        setGstAddress("");
        setStreet("");
        setArea("");
        setPincode("");
        setStateName("");
        setCity("");
    };

    // 🟢 NOW MAKE accordionItems ARRAY (LIKE YOUR FORMAT)
    const accordionItems = [
        /** -------------------- CONTACT DETAILS -------------------- */
        {
            id: "contact-details",
            header: <Text className="text-base font-semibold dark:text-white">Contact Details</Text>,
            body: (
                <View className="bg-slate-700 p-3 rounded-lg">
                    {/* MOBILE */}
                    <Text className="text-gray-300 mb-1">Mobile</Text>
                    <TextInput
                        className="border border-gray-400 rounded px-3 py-2 text-white"
                        keyboardType="number-pad"
                        placeholder="Enter Mobile"
                        value={mobile}
                        onChangeText={(value) => handelvalidationContact(value, "mobile")}
                        onBlur={() => handelvalidationContactonBlur(mobile, "mobile")}
                    />
                    {mobileVerified ? (
                        <Text className="text-green-500 text-sm mt-1">Verified</Text>
                    ) : (
                        <Pressable onPress={() => setOtpmodal(true)}>
                            <Text className="text-yellow-400 text-sm mt-1">Verify (Optional)</Text>
                        </Pressable>
                    )}

                    {/* EMAIL */}
                    <Text className="text-gray-300 mt-4 mb-1">Email</Text>
                    <TextInput
                        className="border border-gray-400 rounded px-3 py-2 text-white"
                        keyboardType="email-address"
                        placeholder="Enter Email"
                        value={email}
                        onChangeText={(v) => setEmail(v)}
                        onBlur={() => setEmailVerified(true)}
                    />
                    {emailVerified ? (
                        <Text className="text-green-500 text-sm mt-1">Verified</Text>
                    ) : (
                        <Pressable onPress={() => setEmailOtpmodal(true)}>
                            <Text className="text-yellow-400 text-sm mt-1">Verify (Optional)</Text>
                        </Pressable>
                    )}
                </View>
            ),
        },

        /** ------------------ RESERVATION DETAILS ------------------ */
        {
            id: "reservation",
            header: (
                <Text className="text-base font-semibold dark:text-white">
                    Reservation Choice
                </Text>
            ),
            body: (
                <View className="bg-slate-700 p-3 rounded-lg">

                    {/* 🔹 AUTO UPGRADE */}
                    <Pressable
                        className="flex-row items-center gap-2 mb-4"
                        disabled={trainOwner === TrainOwnerEnum.IRCTC_TRAIN}
                        onPress={() => {
                            if (trainOwner === TrainOwnerEnum.INDIAN_RAILWAY) {
                                setAutoUpgrade(!autoUpgrade);
                            }
                        }}
                    >
                        <View
                            className={`w-5 h-5 border rounded justify-center items-center 
                            ${autoUpgrade && trainOwner === TrainOwnerEnum.INDIAN_RAILWAY
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-400"
                                }`}
                        >
                            {autoUpgrade && trainOwner === TrainOwnerEnum.INDIAN_RAILWAY && (
                                <Ionicons name="checkmark" size={14} color="#fff" />
                            )}
                        </View>
                        <Text className="text-white text-sm">
                            Auto Upgrade{" "}
                            {trainOwner === TrainOwnerEnum.IRCTC_TRAIN && (
                                <Text className="text-yellow-400">
                                    (Allowed only in Indian Railways)
                                </Text>
                            )}
                        </Text>
                    </Pressable>

                    {/* 🔹 BOOK IF CONFIRM */}
                    <Pressable
                        className="flex-row items-center gap-2 mb-4"
                        disabled={isWaitingTrain}
                        onPress={() => setBookIfConfirm(!bookIfConfirm)}
                    >
                        <View
                            className={`w-5 h-5 border rounded justify-center items-center 
                          ${bookIfConfirm
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-400"
                                }`}
                        >
                            {bookIfConfirm && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <Text className="text-white text-sm">Book if Confirm</Text>
                    </Pressable>

                    {/* 🔹 TRAVEL INSURANCE */}
                    <Pressable
                        className="flex-row items-center gap-2 mb-4"
                        disabled={railavconfigform?.bkgCfg?.travelInsuranceEnabled === "false"}
                        onPress={() => setTravelInsurance(!travelInsurance)}
                    >
                        <View
                            className={`w-5 h-5 border rounded justify-center items-center 
                         ${travelInsurance ? "bg-green-500" : "border-gray-400"}`}
                        >
                            {travelInsurance && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <Text className="text-white text-sm">Travel Insurance*</Text>
                    </Pressable>

                    {/* 🔹 RADIO – CHOICE */}
                    <View className="mt-2">
                        {[
                            "None",
                            "Book if same coach",
                            "Book if 1 lower",
                            "Book if 2 lower",
                        ].map((opt, index) => (
                            <Pressable
                                key={index}
                                className="flex-row items-center gap-2 mb-3"
                                disabled={
                                    (opt === "Book if 2 lower" || opt === "Book if same coach") &&
                                    passengers?.length < 2 ||
                                    railavconfigform?.avlDayList[0]?.availablityStatus?.startsWith("CURR_AVBL")
                                }
                                onPress={() => setChoice(opt)}
                            >
                                <View
                                    className={`w-5 h-5 rounded-full border justify-center items-center
                                      ${choice === opt
                                            ? "bg-green-500 border-green-500"
                                            : "border-gray-400"
                                        }`}
                                >
                                    {choice === opt && (
                                        <Ionicons name="radio-button-on" size={16} color="#fff" />
                                    )}
                                </View>
                                <Text className="text-white text-sm">{opt}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* 🔹 FOOD CHOICE */}
                    {railavconfigform?.bkgCfg?.foodChoiceEnabled === "true" &&
                        trainOwner === TrainOwnerEnum.INDIAN_RAILWAY && (
                            <View className="mt-3">
                                <FoodChoiceCheckbox
                                    dontWantFood={dontWantFood}
                                    setDontWantFood={setDontWantFood}
                                />
                            </View>
                        )}

                    {/* 🔹 CURR_AVBL Warning */}
                    {railavconfigform?.avlDayList[0]?.availablityStatus?.startsWith("CURR_AVBL") && (
                        <Text className="text-yellow-300 text-sm mt-3">
                            ⚠️ Booking is currently under {" "}
                            <Text className="font-bold">Current Availability (CURR_AVBL)</Text>.
                            Seat preferences will not be applied.
                        </Text>
                    )}
                </View>
            ),
        },


        /** -------------------- GST DETAILS -------------------- */
        {
            id: "gst-details",
            header: (
                <Text className="text-base font-semibold dark:text-white">
                    GST Details
                </Text>
            ),
            body: (
                <View className="bg-slate-700 p-3 rounded-lg">

                    {/* GST Number */}
                    <Text className="text-sm text-gray-300 mb-1">GST Number</Text>
                    <TextInput
                        value={gstNumber}
                        onChangeText={(value) => GsTDetails("gstno", value)}
                        onBlur={() => handelGstValidation("gstno", gstNumber)}
                        placeholder="GST No."
                        autoCapitalize="none"
                        className="border border-gray-500 rounded px-3 py-2 text-white mb-3"
                    />

                    {/* GST Legal Name */}
                    <Text className="text-sm text-gray-300 mb-1">GST Legal Name</Text>
                    <TextInput
                        value={gstName}
                        onChangeText={(value) => GsTDetails("gstName", value)}
                        onBlur={() => handelGstValidation("gstName", gstName)}
                        placeholder="GST Legal Name"
                        autoCapitalize="words"
                        className="border border-gray-500 rounded px-3 py-2 text-white mb-3"
                    />

                    {/* GST Address */}
                    <Text className="text-sm text-gray-300 mb-1">GST Address</Text>
                    <TextInput
                        value={gstAddress}
                        onChangeText={(value) => GsTDetails("gstadress", value)}
                        placeholder="GST Address"
                        className="border border-gray-500 rounded px-3 py-2 text-white mb-3"
                    />

                    {/* STREET & AREA */}

                    <Text className="text-sm text-gray-300 mb-1">Street</Text>
                    <TextInput
                        value={street}
                        onChangeText={(value) => GsTDetails("street", value)}
                        placeholder="Street"
                        className="border border-gray-500 rounded px-3 py-2 text-white"
                    />



                    <Text className="text-sm text-gray-300 mb-1">Area</Text>
                    <TextInput
                        value={area}
                        onChangeText={(value) => GsTDetails("area", value)}
                        placeholder="Area"
                        className="border border-gray-500 rounded px-3 py-2 text-white"
                    />



                    {/* PINCODE & STATE */}

                    <Text className="text-sm text-gray-300 mb-1">Pincode</Text>
                    <TextInput
                        value={pincode}
                        onChangeText={(value) => GsTDetails("pincode", value)}
                        onBlur={() => handelGstValidation("pincode", pincode)}  // 👈 Validation Call
                        keyboardType="numeric"
                        maxLength={6}
                        placeholder="Pincode"
                        className="border border-gray-500 rounded px-3 py-2 text-white"
                    />



                    <Text className="text-sm text-gray-300 mb-1">State</Text>
                    <TextInput
                        value={stateName}
                        editable={false} // 👈 prevent editing
                        placeholder="State"
                        className="border border-gray-500 rounded px-3 py-2 text-gray-400"
                    />



                    {/* CITY */}

                    <Text className="text-sm text-gray-300 mb-1">City</Text>
                    <TextInput
                        value={city}
                        editable={false} // 👈 prevent editing
                        placeholder="City"
                        className="border border-gray-500 rounded px-3 py-2 text-gray-400"
                    />

                    {/* SAVE & CLEAR BUTTONS */}
                    <View className="flex-1 flex-row justify-between items-center mt-2">
                        <Pressable
                            className="p-2 bg-green-600 rounded"
                        // onPress={SaveGSTMaster}
                        >
                            <MaterialIcons name="save" size={20} color="#fff" />
                        </Pressable>

                        <Pressable
                            className="p-2 bg-red-600 rounded"
                            onPress={() => ClearGSTField()}
                        >
                            <MaterialIcons name="delete" size={20} color="#fff" />
                        </Pressable>
                    </View>

                </View>
            ),
        },

    ];

    const [mode, setMode] = useState('');
    const [coachID, setcochID] = useState('');

    const bookingMode = (value: string) => {
        setMode(value);
    };

    const isOTPOrDeviceExpired = () => {
        const validityNotAfter = railprofile?.OTP_End_Date;

        // If validityNotAfter doesn't exist, consider it expired or not set
        if (!validityNotAfter) {
            return true;
        }

        // Parse the validity date and compare it with the current time
        const expiryDate = DateTime.fromISO(validityNotAfter);
        return DateTime.now() >= expiryDate;
    };

    const isDSCDisabled = () => {
        const validityNotAfter = railprofile?.deviceDetails?.validityNotAfter;
        if (!validityNotAfter) {
            // If the validity date does not exist, disable the button.
            return true;
        }
        // Check if the validity date is in the past.
        const expiryDate = DateTime.fromISO(validityNotAfter);
        const now = DateTime.now();
        return now > expiryDate; // This will be true if the date is in the past, meaning it's expired.
    };

    // 🧠 Convert reservationChoice number → UI friendly text
    const getReservationChoice = (mode: number, passenger: number): string => {
        switch (mode) {
            case 99:
                return 'None';
            case 1:
                return 'Book if same coach';
            case 2:
                return 'Book if 1 lower';
            case 3:
                if (passenger > 1) {
                    return 'Book if 2 lower';
                } else {
                    return 'None';
                }
            case 4:
                return 'None';
            case 5:
                return 'Book if same coach';
            case 6:
                return 'Book if 1 lower';
            case 7:
                return 'Book if 2 lower';
            default:
                return 'None'; // Ensure a string is always returned
        }
    };

    // Function to calculate reservationMode
    const getReservationMode = (): number => {
        if (!confirm) {
            switch (choice) {
                case 'None':
                    return 99;
                case 'Book if same coach':
                    return 1;
                case 'Book if 1 lower':
                    return 2;
                case 'Book if 2 lower':
                    return 3;
                default:
                    return 0; // Default value if no option is selected
            }
        } else {
            switch (choice) {
                case 'None':
                    return 4;
                case 'Book if same coach':
                    return 5;
                case 'Book if 1 lower':
                    return 6;
                case 'Book if 2 lower':
                    return 7;
                default:
                    return 0; // Default value if no option is selected
            }
        }
    };

    const reservationChoice = getReservationMode();


    // 🚀 LOAD INITIAL BOOKING DATA FROM ASYNC STORAGE (EXPO VERSION)
    useEffect(() => {
        const loadInitialBooking = async () => {
            try {
                const initialBooking = await AsyncStorage.getItem("initialBooking");

                if (initialBooking && railavconfigform) {
                    const initialBookingData = JSON.parse(initialBooking);

                    // ------------------ PASSENGER LIST (RB request) ------------------
                    const passengersFromRBrequest = initialBookingData.passengerList?.map(
                        (passenger: any) => ({
                            name: capitalizeWords(passenger.passengerName) || "",
                            age: passenger?.passengerAge?.toString() || "",
                            gender: passenger?.passengerGender || "",
                            berth: railavconfigform?.bkgCfg?.applicableBerthTypes?.includes(
                                passenger.passengerBerthChoice
                            )
                                ? passenger.passengerBerthChoice
                                : "",
                            nationality: passenger.passengerNationality || "",
                            meal:
                                railavconfigform?.bkgCfg?.foodChoiceEnabled == "true"
                                    ? railavconfigform?.bkgCfg?.foodDetails?.includes(
                                        passenger?.passengerFoodChoice
                                    )
                                        ? passenger.passengerFoodChoice
                                        : railavconfigform?.bkgCfg?.foodDetails?.[0]
                                    : "",
                            optberth: !(
                                railavconfigform?.bkgCfg?.childBerthMandatory === "false" &&
                                passenger.childBerthFlag === false
                            ),
                            bedroll: passenger.passengerBedrollChoice ? true : false,
                            dob:
                                passenger?.psgnConcDOB &&
                                `${passenger?.psgnConcDOB?.substring(0, 4)}-${passenger?.psgnConcDOB?.substring(4, 6)}-${passenger?.psgnConcDOB?.substring(6, 8)}`,
                            idCardType: passenger.passengerCardType || "",
                            idNumber: passenger.passengerCardNumber || "",
                            _id: passenger.id,
                        })
                    );

                    // ----------------- SET PASSENGERS STATE -----------------
                    // setSelectedPassengers(() => {
                    //     const bookingIDs = initialBookingData?.passengerList?.map(
                    //         (p: any) => p.id
                    //     ) || [];

                    //     const selectedPassengers = passengerMasterList.filter((pax: any) =>
                    //         bookingIDs.includes(pax._id)
                    //     );

                    //     let selectedInfants = [];
                    //     if (initialBookingData?.infantList?.length > 0) {
                    //         const infantIDs = initialBookingData?.infantList.map(
                    //             (infant: any) => infant.id
                    //         );
                    //         selectedInfants = passengerMasterList.filter((pax: any) =>
                    //             infantIDs.includes(pax._id)
                    //         );
                    //     }

                    //     return [...selectedPassengers, ...selectedInfants];
                    // });

                    // ----------------- MAIN STATES UPDATE -----------------
                    setDontWantFood(initialBookingData?.dontWantFood);
                    setPassengers(passengersFromRBrequest || []);
                    setNumberOfPassengers(passengersFromRBrequest?.length || 1);
                    setcochID(initialBookingData?.coachId ?? "");
                    setAutoUpgrade(initialBookingData?.autoUpgradationSelected ?? false);

                    // ----------------- GST DETAILS -----------------
                    setGstNumber(initialBookingData?.gstDetails?.gstIn ?? "");
                    setGstName(initialBookingData?.gstDetails?.nameOnGst ?? "");
                    setGstAddress(initialBookingData?.gstDetails?.flat ?? "");
                    setStreet(initialBookingData?.gstDetails?.street ?? "");
                    setArea(initialBookingData?.gstDetails?.area ?? "");
                    setPincode(initialBookingData?.gstDetails?.pin ?? "");
                    setStateName(initialBookingData?.gstDetails?.state ?? "");
                    setCity(initialBookingData?.gstDetails?.city ?? "");

                    // ----------------- INFANTS -----------------
                    if (initialBookingData?.infantList?.length > 0) {
                        setInfants(
                            initialBookingData.infantList.map((infant: any) => ({
                                name: capitalizeWords(infant.name) || "",
                                age: infant.age.toString() || "",
                                gender: infant.gender || "",
                                _id: infant.id,
                            })) ?? []
                        );
                    }

                    // ----------------- RESERVATION SELECTION -----------------
                    bookingMode(initialBookingData?.reservationMode ?? "");

                    const passengerLength = initialBookingData?.passengerList?.length;
                    setChoice(
                        initialBookingData?.reservationChoice
                            ? getReservationChoice(initialBookingData.reservationChoice, passengerLength)
                            : "None"
                    );
                    setConfirm([4, 5, 6, 7].includes(initialBookingData?.reservationChoice));

                    // ----------------- FETCH EXTRA DATA -----------------
                    setExtrailreqId(initialBookingData?.extrailreqId ?? "");
                    setMobile(initialBookingData?.mobileNumber || "");
                    setEmail(initialBookingData?.email || "");
                }

                // ✔ READ reservationMode ALSO FROM AsyncStorage
                const mode = await AsyncStorage.getItem("reservationMode");
                if (mode) bookingMode(JSON.parse(mode));

            } catch (error) {
                console.log("❌ Error loading initialBooking:", error);
            }
        };

        loadInitialBooking(); // CALL FUNCTION
    }, [railavconfigform]);


    const isPassengerListValid = () => {
        if (passengers.length === 0) {
            Alert.alert("Validation Error", "At least one passenger is required.");
            return false;
        }

        for (let i = 0; i < passengers.length; i++) {
            let valid = true;

            const filteredPassengers = passengers.filter((passenger, index) => {
                const { name, age, gender } = passenger;

                // ❌ Remove passenger if both empty
                if (!name?.trim() && !age?.trim()) {
                    return false;
                }

                // ⚠ Required fields check
                if (!name?.trim() || !age?.trim() || !gender?.trim()) {
                    showMessage(
                        "Missing Information",
                        `Please fill in all fields for passenger ${index + 1}.`
                    );
                    setContinueloading(false);
                    valid = false;
                }

                return true;
            });

            // 🧠 UPDATE ONLY IF VALID AND LENGTH CHANGED
            if (valid && filteredPassengers.length !== passengers.length) {
                setPassengers(filteredPassengers);
                setNumberOfPassengers(filteredPassengers.length);
            }

            return valid;
        }

        // ❌ Booking mode check
        if (!mode || mode === "") {
            setContinueloading(false);
            showMessage("Booking Mode Required", "Please select booking mode first.");
            return false;
        }

        return true; // 🚀 VALID
    };


    // 🧠 Validate Infant Details — React Native Version
    const isInfantListValid = () => {
        if (infants.length === 0) {
            return true;  // no infant added → no validation needed
        }

        for (let i = 0; i < infants.length; i++) {
            const infant = infants[i];
            const name = infant?.name?.trim() || "";
            const age = infant?.age?.trim() || "";
            const gender = infant?.gender?.trim() || "";

            // If ANY field has value → MUST validate all three
            if (name !== "" || age !== "" || gender !== "") {
                if (!name || !age || !gender) {
                    showMessage(
                        "Invalid Infant Details",
                        `Please fill all required fields for infant ${i + 1}.`
                    );
                    setContinueloading(false);
                    return false;
                }
            }
        }
        return true;
    };

    // --------------------------------------------------
    // 🚀 FUNCTION: navigateToBookingReview()
    // --------------------------------------------------
    const navigateToBookingReview = async (isback?: boolean, splitString?: string) => {
        // 👉 Step 1: Validate first passenger if only 1
        if (passengers.length === 1 && !isback) {
            const p = passengers[0];
            if (!p.name || !p.age || !p.gender) {
                showMessage("Validation Error", "Please fill all required fields for passenger 1.");
                setContinueloading(false);
                return;
            }
        }

        // 👉 Step 2: If booking mode is empty, show modal (already set in your UI)
        if (mode === "") {
            setBookingModeModel(true);
            return;
        }

        // 👉 Step 3: Fetch requisition ID from AsyncStorage
        const reqId = await AsyncStorage.getItem("requisitionid");

        // --------------------------------------------------
        // 🧠 Build Passenger List Exactly Like Production
        // --------------------------------------------------
        const passengerList = passengers
            ?.filter((passenger) => !passenger.isChild)
            .map((passenger, index) => {
                const result: any = {
                    passengerAge: passenger.age,
                    passengerBedrollChoice: passenger.bedroll === "Yes",
                    passengerBerthChoice: passenger.berth ?? "",
                    passengerGender: passenger.gender ?? "",
                    passengerIcardFlag: false,
                    passengerName: passenger.name ?? "",
                    passengerSerialNumber: index + 1,
                    passengerNationality: passenger.nationality ?? "",
                    passengerFoodChoice: dontWantFood ? "D" : passenger.meal ?? "",
                    passengerCardType:
                        passenger.nationality !== "IN" &&
                            !railavconfigform?.bkgCfg?.bonafideCountryList?.includes(passenger.nationality)
                            ? passenger.idCardType
                            : "",
                    passengerCardNumber: passenger.idNumber,
                    childBerthFlag: Boolean(passenger.optberth),
                    psgnConcDOB: DOBformateYYYYDDMM(passenger.dob),
                    id: passenger._id
                };

                if (
                    passenger.nationality !== "IN" &&
                    !railavconfigform?.bkgCfg?.bonafideCountryList?.includes(passenger.nationality)
                ) {
                    result.passengerIcardFlag = true;
                }

                if (passenger.nationality !== "IN") {
                    const year = Number(result.psgnConcDOB.substring(0, 4));
                    const month = Number(result.psgnConcDOB.substring(4, 6));
                    const day = Number(result.psgnConcDOB.substring(6, 8));
                    result.passengerAge = calculateAge(year, month, day).toString();
                }

                return result;
            });

        // --------------------------------------------------
        // 👵 Senior Citizen Check (Same Logic As Next.js)
        // --------------------------------------------------
        const seniorCitizensCount = passengerList.filter((p) => {
            if (p.passengerGender === "M") return Number(p.passengerAge) >= 60;
            return Number(p.passengerAge) >= 45;
        }).length;

        if (
            (railavconfigform?.quota === "SS" || railavconfigform?.quota === "GN") &&
            !splitString &&
            !isback &&
            passengerList.length === 2 &&
            seniorCitizensCount === 2
        ) {
            setSeniorCitizenModal(true);
            return false;
        }



        // --------------------------------------------------
        // 🧠 Build Data Object (EXACTLY AS IN PRODUCTION)
        // --------------------------------------------------
        const searchType = (await AsyncStorage.getItem("searchType")) || "0";

        const data = {
            searchType: Number(searchType),
            extrailreqId,
            autoUpgradationSelected:
                trainOwner === TrainOwnerEnum.INDIAN_RAILWAY && autoUpgrade,
            mobileNumber: mobile || customerMobileNumber,
            email,
            customerMobileNumber,
            travelInsuranceOpted: travelInsurance,
            reservationChoice:
                passengerList.length < 2 && reservationChoice === 3 ? 99 : reservationChoice,
            boardingStation: selectedBoardingPoint,
            reservationMode: mode,
            coachId: coachID,
            ...(splitString && { ssQuotaSplitCoach: splitString }),
            ...(gstNumber && {
                gstDetails: {
                    gstIn: gstNumber,
                    nameOnGst: gstName,
                    flat: gstAddress,
                    street,
                    area,
                    pin: pincode,
                    state: stateName,
                    city
                }
            }),
            passengerList,
            ...(infants.length > 0 && {
                infantList: infants
                    .filter((infant) => infant.name.trim() !== "")
                    .map((infant, index) => ({
                        infantSerialNumber: index + 1,
                        name: infant.name,
                        age: infant.age,
                        gender: infant.gender,
                        id: infant._id
                    }))
            }),
            ...(reqId && {
                requisitionid: JSON.parse(reqId)?.railBookingID
            })
        };


        // --------------------------------------------------
        // 🔙 IF BACK FUNCTION → STORE & NAVIGATE BACK
        // --------------------------------------------------
        if (isback) {
            await AsyncStorage.setItem(
                "initialBooking",
                JSON.stringify({ ...data, autoUpgradationSelected: autoUpgrade, dontWantFood })
            );
            router.back();
            return;
        }

        // --------------------------------------------------
        // ⚠️ FINAL VALIDATION BEFORE API CALL
        // --------------------------------------------------
        setContinueloading(true);
        if (!isPassengerListValid() || !isInfantListValid()) {
            setContinueloading(false);
            return;
        }

        // --------------------------------------------------
        // 🚀 API CALL ON SUBMIT
        // --------------------------------------------------
        try {
            const url = `${railavconfigform?.trainNo}/${convertDateIRCTCformate(
                selectedTDate
            )}/${railavconfigform?.from}/${railavconfigform?.to}/${railavconfigform?.enqClass}/${railavconfigform?.quota === "SS" ? "GN" : railavconfigform?.quota
                }`;

            const response = await Railavconfig(data, url);

            if (response?.data?.errorMessage || response?.data?.error) {
                const msg = response.data.errorMessage || response.data.error;
                showMessage("Error", msg);
                setContinueloading(false);
                return;
            }

            // 👉 Save required data & Navigate
            await AsyncStorage.setItem(
                "railBookingid",
                JSON.stringify(response?.data?.railBookingID)
            );

            await AsyncStorage.setItem(
                "initialBooking",
                JSON.stringify({ ...data, autoUpgradationSelected: autoUpgrade, dontWantFood })
            );

            await AsyncStorage.setItem(
                "reservationMode",
                JSON.stringify(data.reservationMode)
            );

            router.push("/rail/bookingreview" as any); // 🔥 move to page

        } catch (error: any) {
            console.log("API Error:", error);
            showMessage("Error", error.message || "An error occurred.");
        } finally {
            setContinueloading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: theme.background }}>
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-base" style={{ color: theme.text }}>
                    Loading booking details...
                </Text>
            </View>
        );
    }

    if (apiError) {
        return (
            <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: theme.background }}>
                <Ionicons name="alert-circle" size={64} color="#EF4444" />
                <Text className="mt-4 text-base text-center" style={{ color: theme.text }}>
                    {apiError}
                </Text>
            </View>
        );
    }

    if (apiErrorComponent) {
        return apiErrorComponent;
    }

    if (!railavconfigform) {
        return (
            <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: theme.background }}>
                <Text className="text-base text-center" style={{ color: theme.text }}>
                    No booking data available
                </Text>
            </View>
        );
    }


    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={{ padding: 0 }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => router.push("/rail/trainavailability")}
                        className="p-2">
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold" style={{ color: theme.text }}>
                        Fill Booking Details
                    </Text>
                </View>
                <TouchableOpacity className="flex-row items-center bg-indigo-600 px-4 py-2.5 rounded-lg gap-2">
                    <Ionicons name="train" size={18} color="#FFFFFF" />
                    <Text className="text-white font-semibold">Search Train</Text>
                </TouchableOpacity>
            </View>

            {/* Train Card */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
                {/* Class and Train Number Row */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <View className="bg-orange-500 px-3 py-1 rounded">
                            <Text className="text-white font-bold text-sm">{railavconfigform.enqClass}</Text>
                        </View>
                        <View className="bg-green-600 px-3 py-1 rounded">
                            <Text className="text-white font-bold text-sm">{railavconfigform.quota}</Text>
                        </View>
                        <View className="bg-green-700 px-2 py-1 rounded flex-row items-center">
                            <View className="w-2 h-2 bg-white rounded-full" />
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            onPress={() => setAutoUpgrade(!autoUpgrade)}
                        >
                            <View className={`w-4 h-4 border-2 rounded ${autoUpgrade ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'} justify-center items-center`}>
                                {autoUpgrade && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                            </View>
                            <Text className="text-white text-xs">Auto Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="bg-red-600 px-3 py-1 rounded flex-row items-center gap-1.5">
                        <Ionicons name="train" size={16} color="#FFFFFF" />
                        <Text className="text-white font-bold text-sm">{railavconfigform.trainNo}</Text>
                    </View>
                </View>

                {/* Train Name */}
                <Text className="text-white text-lg font-bold text-right mb-4">
                    {railavconfigform.trainName}
                </Text>

                {/* Journey Details */}
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-blue-400 text-xs mb-1">Departure</Text>
                        <Text className="text-white font-bold text-sm mb-1">
                            {formatDateWithDay(trainTimings.AvailabilityDateUTC || selectedTDate)}
                        </Text>
                        <Text className="text-blue-400 text-xs">

                            {railavconfigform.from} - {trainTimings.fstationName}
                        </Text>
                    </View>
                    <View className="flex-1 items-end">
                        <Text className="text-red-400 text-xs mb-1">Arrival</Text>
                        <Text className="text-white font-bold text-sm mb-1">
                            {formatDateWithDay(trainTimings.ArrivalDate || selectedTDate)}
                        </Text>
                        <Text className="text-red-400 text-xs text-right">
                            {railavconfigform.to} - {trainTimings.tostationName}
                        </Text>
                    </View>
                </View>

                {/* Distance and Duration */}
                <Text className="text-gray-400 text-xs text-center mb-4">
                    {trainTimings.distance} Km - {trainTimings.halt} Halts - {trainTimings.duration}
                </Text>

                {/* Availability Status */}
                <View className="bg-slate-700 rounded-lg p-3 mb-3 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                        <View className="bg-green-500 px-3 py-1 rounded-full">
                            <Text className="text-white font-bold text-xs">
                                {railavconfigform.avlDayList[0]?.availablityStatus || 'N/A'}
                            </Text>
                        </View>
                        <View className="bg-blue-600 px-2 py-1 rounded-full">
                            <Ionicons name="information-circle" size={16} color="#FFFFFF" />
                        </View>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <Text className="text-green-400 text-xl font-bold">
                            ₹ {(
                                Number(railavconfigform.totalFare) +
                                Number(railavconfigform.wpServiceTax) +
                                Number(railavconfigform.wpServiceCharge)
                            ).toFixed(2)}
                        </Text>
                        <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
                    </View>
                </View>

                {/* Book if Confirm & Travel Insurance */}
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        className="flex-row items-center gap-2"
                        onPress={() => setBookIfConfirm(!bookIfConfirm)}
                    >
                        <View className={`w-4 h-4 border-2 rounded ${bookIfConfirm ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'} justify-center items-center`}>
                            {bookIfConfirm && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                        <Text className="text-white text-xs">Book if Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center gap-2"
                        onPress={() => setTravelInsurance(!travelInsurance)}
                    >
                        <View className={`w-4 h-4 border-2 rounded ${travelInsurance ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'} justify-center items-center`}>
                            {travelInsurance && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                        <Text className="text-white text-xs">Travel Insurance*</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Boarding Details */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <Text className="text-white font-bold text-center mb-4">Boarding at:</Text>

                {/* CURRENT SELECTED BOARDING */}
                <TouchableOpacity
                    onPress={() => setBoardingDropdownOpen(!boardingDropdownOpen)}
                    className="bg-slate-700 rounded-lg p-3 mb-4 flex-row justify-between items-center"
                >
                    <Text className="text-white text-sm flex-1">
                        {selectedBoarding
                            ? `${selectedBoarding.stnNameCode} | ${new Date(
                                selectedBoarding.boardingDate
                            ).toLocaleDateString("en-GB")} at ${selectedBoarding.departureTime}`
                            : "Select Boarding Station"}
                    </Text>


                    <MaterialCommunityIcons name="pencil" size={18} color="#F59E0B" />
                </TouchableOpacity>

                {/* DROPDOWN — SHOW ONLY WHEN CLICKED */}
                {boardingDropdownOpen && (
                    <View className="bg-slate-700 rounded-lg overflow-hidden">
                        <ScrollView className="max-h-56">
                            {boardingStationList.map((station, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => {
                                        setSelectedBoarding(station);
                                        setBoardingDropdownOpen(false);
                                    }}
                                    className="p-3 border-b border-slate-600"
                                >
                                    <Text className="text-gray-300 text-sm">
                                        {station.stnNameCode} |
                                        {new Date(station.boardingDate).toLocaleDateString("en-GB")}
                                        {` at ${station.departureTime}`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* Passenger Details form  */}

            <View
                className={`mt-1 p-3 rounded flex flex-col gap-3  border bg-gray-800`}
            >
                {/* -------------------- PASSENGERS --------------------- */}
                <View className="flex flex-col gap-2">
                    <Text className="text-lg font-semibold my-2 text-gray-800 dark:text-gray-200">
                        Passengers
                    </Text>

                    <ReusableAccordion
                        items={passengerAccordions}
                        activeId={activeAccordionId}
                        onToggle={handleToggleAccordion}
                    />

                    <View className="flex flex-col md:flex-row md:justify-between">
                        <View className="flex flex-col justify-start">

                            {/* Food Choice Checkbox */}
                            {railavconfigform?.bkgCfg?.foodChoiceEnabled === "true" &&
                                trainOwner === TrainOwnerEnum.INDIAN_RAILWAY && (
                                    <FoodChoiceCheckbox
                                        dontWantFood={dontWantFood}
                                        setDontWantFood={setDontWantFood}
                                    />
                                )}

                            {/* Food Choice Message */}
                            {railavconfigform?.bkgCfg?.foodChoiceEnabled === "true" &&
                                trainOwner === TrainOwnerEnum.INDIAN_RAILWAY && (
                                    <Text className="mt-2 flex flex-row items-center gap-2 text-gray-700 dark:text-gray-300">
                                        {!dontWantFood ? (
                                            <>
                                                {/* <Icon path={mdiCheckCircle} size={20} color="#22c55e" /> */}
                                                <Text className="font-medium text-green-500">
                                                    Food choice is enabled for all passengers
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                {/* <Icon path={mdiCloseCircle} size={20} color="#f59e0b" /> */}
                                                <Text className="font-medium text-yellow-500">
                                                    Food will not be provided for any of the passengers
                                                </Text>
                                            </>
                                        )}
                                    </Text>
                                )}
                        </View>

                        {/* Add Passenger */}
                        {passengers.length <
                            Number(railavconfigform?.bkgCfg?.maxPassengers) && (
                                <Pressable
                                    onPress={addPassengerList}
                                    className="self-end mt-3 px-3 py-1 border border-blue-500 rounded"
                                >
                                    <Text className="text-blue-500 font-semibold">+ Add Passenger</Text>
                                </Pressable>
                            )}
                    </View>
                </View>

                {/* -------------------- INFANTS --------------------- */}
                <View className="flex flex-col gap-2">
                    <Text className="text-lg font-semibold my-2 text-gray-800 dark:text-gray-200">
                        Infant Below 5 Years
                    </Text>

                    <ReusableAccordion
                        items={infantAccordions}
                        activeId={activeAccordionId}
                        onToggle={handleToggleAccordion}
                    />

                    {/* Add Infant Button */}
                    {infants.length <
                        Number(railavconfigform?.bkgCfg?.maxInfants) && (
                            <View className="flex justify-end">
                                <Pressable
                                    onPress={addInfantList}
                                    className="self-end px-3 py-1 border border-blue-500 rounded"
                                >
                                    <Text className="text-blue-500 font-semibold">
                                        + Add Infant without Berth
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                </View>
            </View>

            <View className="w-full mt-4">

                {/* CONTACT DETAILS ACCORDION */}
                <View className="bg-slate-800 p-3 rounded-lg mb-4">
                    <ContactDetailsAcordian
                        items={accordionItems}
                        activeId={activeAccordionId}
                        onToggle={HandelContactAcordian}
                    />
                </View>

                {/* REFRESH BOOKING MODE CARD */}
                <View className="bg-slate-800 p-4 rounded-lg mb-4 border border-slate-600 relative">

                    {/* REFRESH BUTTON */}
                    <Pressable
                        onPress={HandleRefreshProfile}
                        className="absolute right-3 top-3 w-8 h-8 rounded-full bg-indigo-600 
             border border-slate-300 justify-center items-center"
                    >
                        <Ionicons name="refresh" size={18} color="white" />
                    </Pressable>

                    {/* TITLE */}
                    <Text className="text-center text-white text-base mb-4">Select Booking Mode</Text>

                    <View className='flex-row justify-between'>
                        {/* RADIO - OTP */}
                        <View className="flex-row justify-center items-center mb-3">
                            <Pressable
                                onPress={() => bookingMode("B2B_WEB_OTP")}
                                disabled={isOTPOrDeviceExpired()}
                                className="flex-row items-center"
                            >
                                <View
                                    className={`w-5 h-5 border-2 rounded-full mr-2 justify-center items-center ${mode === "B2B_WEB_OTP" ? "border-indigo-500" : "border-gray-400"
                                        }`}
                                >
                                    {mode === "B2B_WEB_OTP" && (
                                        <View className="w-3 h-3 bg-indigo-500 rounded-full" />
                                    )}
                                </View>
                                <Text className="text-white">OTP</Text>
                            </Pressable>

                            {/* Tooltip icon replacement */}
                            <Pressable className="ml-3">
                                <Ionicons name="information-circle-outline" size={18} color="orange" />
                            </Pressable>
                        </View>

                        {/* RADIO - DSC */}
                        <View className="flex-row justify-center items-center mb-3">
                            <Pressable
                                onPress={() => bookingMode("WS_TA_B2B")}
                                disabled={isDSCDisabled()}
                                className="flex-row items-center"
                            >
                                <View
                                    className={`w-5 h-5 border-2 rounded-full mr-2 justify-center items-center ${mode === "WS_TA_B2B" ? "border-indigo-500" : "border-gray-400"
                                        }`}
                                >
                                    {mode === "WS_TA_B2B" && (
                                        <View className="w-3 h-3 bg-indigo-500 rounded-full" />
                                    )}
                                </View>
                                <Text className="text-white">DSC</Text>
                            </Pressable>

                            {/* Tooltip icon replacement */}
                            <Pressable className="ml-3">
                                <Ionicons name="information-circle-outline" size={18} color="red" />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* RAIL ID EXPIRY CARD */}
                <View className="bg-slate-800 p-4 rounded-lg mb-4 border border-slate-600">
                    <Text className="text-white text-center">
                        Rail ID Expiry:{" "}
                        <Text className="font-bold text-yellow-400">
                            {railprofile?.ID_ExpireDate
                                ? DateTime.fromISO(railprofile.ID_ExpireDate).toFormat("dd LLL yyyy")
                                : "Not Available"}
                        </Text>
                    </Text>
                </View>

                {/* DIGITAL CLOCK */}
                <View className="bg-slate-800 p-2 rounded-lg mb-4">
                    <DigitalClockwithHHMMSSA />
                </View>

                {/* BOTTOM BUTTONS */}
                <View className="bg-slate-800 p-4 rounded-lg">
                    <View className="flex-row justify-center gap-4">

                        {/* BACK BUTTON */}
                        <Pressable
                            onPress={() => navigateToBookingReview(true)}
                            className="bg-gray-600 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white">← Back</Text>
                        </Pressable>

                        {/* CONTINUE BUTTON */}
                        <Pressable
                            className={`bg-green-600 px-6 py-2 rounded-lg ${continueloading ? "opacity-50" : ""
                                }`}
                            disabled={continueloading}
                            onPress={() => {
                                if (!mode) {
                                    showMessage("Select Mode", "Please select OTP or DSC.");
                                    return;
                                }
                                navigateToBookingReview(false);
                            }}
                        >
                            <Text className="text-white font-semibold">
                                {continueloading ? "Loading..." : "Continue →"}
                            </Text>
                        </Pressable>
                    </View>
                </View>

            </View>

            {/* Modal below open */}
            {
                isRemoveConfirmModalVisible && (
                    <Modal transparent={true}>
                        <View className="flex-1 justify-center items-center bg-black/50">
                            <View className="bg-white p-4 rounded-lg w-72">
                                <Text className="text-lg font-semibold mb-4">Remove Passenger?</Text>

                                <View className="flex-row justify-end gap-4">
                                    <Pressable onPress={() => setIsRemoveConfirmModalVisible(false)}>
                                        <Text className="text-gray-600">Cancel</Text>
                                    </Pressable>

                                    <Pressable onPress={() => {
                                        performRemovePassenger(selectedPassengerIndex, false);
                                        setIsRemoveConfirmModalVisible(false);
                                    }}>
                                        <Text className="text-red-500 font-bold">Remove</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )
            }

            {/* 📌 Mobile Verification Modal */}
            <CustomModal
                isOpen={otpmodal}
                onClose={() => setOtpmodal(false)}
                title="OTP Mobile Verification"
                showConfirmButton={false}
                showCancelButton={false}
            >
                {showOtpInput ? (
                    // 👉 FIRST SCREEN – ASK TO SEND OTP   
                    <View className='bg-gray-800 p-2'>
                        <View>
                            <Text className="text-gray-700 dark:text-gray-200 mb-2">Enter OTP</Text>
                            <TextInput
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                placeholder="Enter OTP"
                                maxLength={6}
                                className="border border-gray-400 text-gray-900 dark:text-white dark:border-gray-600 rounded px-3 py-2"
                            />
                        </View>

                        <View className="flex-row justify-between mt-4">
                            {/* Resend OTP */}
                            <TouchableOpacity
                                className="bg-indigo-600 px-3 py-2 rounded-lg"
                                onPress={sendOtp}
                            >
                                <Text className="text-white font-semibold">Resend OTP</Text>
                            </TouchableOpacity>

                            {/* Verify */}
                            <TouchableOpacity
                                disabled={otp.length < 4}
                                className={`px-3 py-2 rounded-lg ${otp.length < 4 ? "bg-gray-400" : "bg-green-600"
                                    }`}
                                onPress={verifiyOTP} // 👈 CALL YOUR FUNCTION
                            >
                                <Text className="text-white font-semibold">Verify</Text>
                            </TouchableOpacity>

                            {/* Cancel */}
                            <TouchableOpacity
                                onPress={() => setOtpmodal(false)}
                                className="bg-gray-500 px-3 py-2 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // 👉 SECOND SCREEN – OTP INPUT
                    <View className="items-center">
                        <Text className="text-gray-700 dark:text-gray-200 mb-4">
                            Would you like to send the OTP?
                        </Text>

                        <TouchableOpacity
                            onPress={sendOtp}
                            className="bg-indigo-600 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-semibold">Send OTP</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </CustomModal>

            {/* ==== Email OTP VERIFICATION MODAL ==== */}
            <CustomModal
                isOpen={emailotpmodal}
                onClose={toggleEmailOtpModal}
                title="OTP Email Verification"
                showConfirmButton={false}
                showCancelButton={false}
                centered
            >
                {!showEmailOtpInput ? (
                    <View className="items-center">
                        <Text className="text-base mb-4">Would you like to send the OTP?</Text>

                        <TouchableOpacity
                            onPress={() => {
                                sendOtpOnEmail();
                                setShowEmailOtpInput(true);   // ONLY update Email state ✔
                            }}
                            className="bg-blue-600 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-semibold">Send OTP</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text className="text-base mb-2 font-semibold">Enter OTP</Text>
                        <TextInput
                            className="border border-gray-400 rounded-lg px-3 py-2"
                            keyboardType="numeric"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Enter OTP"
                        />
                    </View>
                )}

                {showEmailOtpInput && (
                    <View className="mt-6 flex-row justify-between w-full">
                        <TouchableOpacity
                            onPress={sendOtpOnEmail}
                            className="bg-blue-600 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-semibold">Resend OTP</Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                disabled={otp.length <= 3}
                                onPress={verifyOTPEmail}
                                className={`px-4 py-2 rounded-lg ${otp.length <= 3 ? "bg-green-600/50" : "bg-green-600"
                                    }`}
                            >
                                <Text className="text-white font-semibold">Verify OTP</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={toggleEmailOtpModal}
                                className="bg-gray-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </CustomModal>



        </ScrollView>
    );
}