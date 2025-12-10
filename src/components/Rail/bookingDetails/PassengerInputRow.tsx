import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import DateInput from '@/src/utils/dateInput';

interface PassengerInputRowProps {
  number: number;
  isChild: boolean;
  data: {
    meal: string;
    optberth?: boolean;
    nationality: string | number | readonly string[] | undefined;
    name: string;
    age: string;
    gender: string;
    berth: string;
    idCardType: string;
    idNumber: string;
    bedroll: string;
    _id?: string;
    dob: string;
  };
  onChange: (field: string, value: string | boolean) => void;
  onBlur: (data: any) => void;
  applicableBerthTypes: string[];
  countryLists: { country: string; countryCode: string }[];
  lowerberthCount: number;
  middleberthCount: number;
  upperberthCount: number;
  sideupperberthCount: number;
  sideLowerberthCount: number;
  sideMiddleberthCount: number;
  foodChoice: string;
  validIdCardTypes: any[];
  bonafideCountryList: any[];
  bedRollFlagEnabled: string;
  foodDetails: any[];
  passengerValidation: {
    maxNameLength: string;
    minNameLength: string;
    minPassengerAge: string;
    maxPassengerAge: string;
    maxChildAge: string;
    childBerthMandatory: string;
    srctnwAge: string;
    srctznAge: string;
  };
  Quota: string;
  name_id: string;
  CateringDefaultOption: boolean;
}

const PassengerInputRow: React.FC<PassengerInputRowProps> = ({
  number,
  isChild,
  data,
  onChange,
  onBlur,
  lowerberthCount,
  middleberthCount,
  upperberthCount,
  sideupperberthCount,
  sideLowerberthCount,
  sideMiddleberthCount,
  applicableBerthTypes,
  countryLists,
  foodChoice,
  validIdCardTypes,
  bonafideCountryList,
  bedRollFlagEnabled,
  foodDetails,
  passengerValidation,
  Quota,
  name_id,
  CateringDefaultOption,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localOptBerth, setLocalOptBerth] = useState(Boolean(data?.optberth));
  const [localBerth, setLocalBerth] = useState(data.berth);
  const [finalDate, setFinalDate] = useState(data?.dob);
  const [dob, setDob] = useState(data.dob || '');


  const calculateAgeByDate = (dob: string) => {
    if (!dob) return 0;
    const birthday = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };


  console.log("data.idNumber is", data.idNumber)
  console.log("finalDate date is", finalDate)





  const handleLocalChange = (field: string, value: any) => {
    switch (field) {
      case 'name':
        const formattedName = value
          .toLowerCase()
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.substring(1))
          .join(' ');

        if (
          /^[A-Za-z ]*$/.test(value) &&
          value.length <= parseInt(passengerValidation.maxNameLength) &&
          !(value.startsWith(' ') || value.includes('  '))
        ) {
          onChange('name', formattedName);
        } else {
          if (
            /^[A-Za-z ]*$/.test(value) &&
            value.length > parseInt(passengerValidation.maxNameLength) &&
            value.length !== 0
          ) {
            Toast.show({
              type: 'info',
              text1: `Maximum ${passengerValidation.maxNameLength} characters is required`,
            });
            onChange('name', formattedName.substring(0, parseInt(passengerValidation.maxNameLength)));
          }
        }
        break;

      case 'age':
        if (/^\d*$/.test(value) && Number(value) <= Number(passengerValidation.maxPassengerAge)) {
          onChange('age', value);

          // If age is a child → optberth must be TRUE
          if (Number(value) < Number(passengerValidation.maxChildAge)) {
            onChange('optberth', true);
          }
        } else {
          onChange('age', '');
        }
        break;

      case 'gender':
        onChange('gender', String(value));
        break;

      case 'berth':
        onChange('berth', String(value));
        break;

      case 'nationality':
        onChange('nationality', String(value));
        break;

      case 'meal':
        onChange('meal', String(value));
        break;

      case 'idCardType':
        onChange('idCardType', String(value));
        break;

      case 'idNumber':
        onChange('idNumber', value);
        break;

      case 'bedroll':
        onChange('bedroll', value);
        break;

      case 'optberth':
        onChange('optberth', value);  // ❤️ Send boolean directly
        break;

      // case "dob":
      //   setDob(value);
      //   onChange("psgnConcDOB", value);   // <-- REQUIRED for API
      //   break;
      case 'dob':
        setDob(value);                 // update local UI
        onChange("dob", value);        // update parent state
        return;

      default:
        onChange(field, value);
        break;
    }
  };



  // ----------------------------------------------------------------
  // 🔹 VALIDATION FUNCTIONS  (USE PARENT STATE ONLY)
  // ----------------------------------------------------------------

  const validateName = (value: string) => {
    if (value.length < Number(passengerValidation.minNameLength) && value.length !== 0) {
      Toast.show({ type: "error", text1: `Minimum ${passengerValidation.minNameLength} characters required` });
      onChange("name", "");
      return;
    }
    if (value.length > Number(passengerValidation.maxNameLength) && value.length !== 0) {
      Toast.show({ type: "error", text1: `Maximum ${passengerValidation.maxNameLength} characters allowed` });
      onChange("name", "");
      return;
    }
  };

  const validateDOB = (value: string) => {
    if (data.nationality !== "IN" && value) {
      let calculatedAge = calculateAgeByDate(value);
      if (calculatedAge === 0) calculatedAge = 1;

      if (calculatedAge > Number(passengerValidation.maxPassengerAge)) {
        Toast.show({ type: "error", text1: `Age must be between 1 and ${passengerValidation.maxPassengerAge}` });
        onChange("dob", "");
        onChange("age", "");
        return;
      }

      validateAgeGender("age", calculatedAge);
      onChange("age", calculatedAge.toString());
    }
  };

  const validateAgeGender = (type: string, value: any) => {
    const numAge = Number(value);

    if (type === "age") {
      if (numAge > Number(passengerValidation.maxPassengerAge)) {
        Toast.show({ type: "error", text1: `Max age is ${passengerValidation.maxPassengerAge}` });
        onChange("age", "");
        return;
      }

      if (Quota === "SS" && numAge < Number(passengerValidation.srctznAge) && (data.gender === "M" || data.gender === "T")) {
        Toast.show({ type: "error", text1: `Min ${passengerValidation.srctznAge} required for Sr. Citizen Male/Trans` });
        onChange("age", "");
        onChange("gender", "");
        return;
      }

      if (Quota === "SS" && numAge < 45 && data.gender === "F") {
        Toast.show({ type: "error", text1: `Minimum 45 required for Sr. Citizen Female` });
        onChange("age", "");
        onChange("gender", "");
        return;
      }

      onChange("age", numAge.toString());
    }

    if (type === "gender") {
      if (
        Quota === "SS" &&
        (value === "M" || value === "T") &&
        Number(data.age) < Number(passengerValidation.srctznAge)
      ) {
        Toast.show({ type: "error", text1: `Min ${passengerValidation.srctznAge} required for Sr. Citizen Male/Trans` });
        onChange("age", "");
        onChange("gender", "");
        return;
      }

      if (Quota === "SS" && value === "F" && Number(data.age) < 45) {
        Toast.show({ type: "error", text1: `Minimum 45 required for Sr. Citizen Female` });
        onChange("age", "");
        onChange("gender", "");
        return;
      }

      onChange("gender", value);
    }
  };

  const validateBerth = (value: string) => {
    if (lowerberthCount == 2 && value === "LB") {
      Toast.show({ type: "error", text1: "Only 2 Lower Berths allowed" });
      onChange("berth", "");
      return;
    }
    if (middleberthCount == 2 && value === "MB") {
      Toast.show({ type: "error", text1: "Only 1 Middle Berth allowed" });
      onChange("berth", "");
      return;
    }
    if (upperberthCount == 2 && value === "UB") {
      Toast.show({ type: "error", text1: "Only 2 Upper Berths allowed" });
      onChange("berth", "");
      return;
    }
    if (sideupperberthCount == 1 && value === "SU") {
      Toast.show({ type: "error", text1: "Only 1 Side Upper Berth allowed" });
      onChange("berth", "");
      return;
    }
    if (sideLowerberthCount == 1 && value === "SL") {
      Toast.show({ type: "error", text1: "Only 1 Side Lower Berth allowed" });
      onChange("berth", "");
      return;
    }
    if (sideMiddleberthCount == 1 && value === "SM") {
      Toast.show({ type: "error", text1: "Only 1 Side Middle Berth allowed" });
      onChange("berth", "");
      return;
    }

    onChange("berth", value);
  };

  // 🚀 VALIDATE BLUR FUNCTION (CALLS THE ABOVE)
  const handelValidateBlur = (type: string, value: any) => {
    if (type === "name") validateName(value);
    if (type === "dob") validateDOB(value);
    if (type === "age") validateAgeGender("age", value);
    if (type === "gender") validateAgeGender("gender", value);
    if (type === "berth") validateBerth(value);

    onBlur(data);
  };

  const getBerthDetails = (berthType: string) => {
    const berthMap: { [key: string]: string } = {
      LB: 'Lower Berth',
      MB: 'Middle Berth',
      UB: 'Upper Berth',
      SL: 'Side Lower',
      SU: 'Side Upper',
      SM: 'Side Middle',
      WS: 'Window Seat',
      CP: 'Coupe',
      CB: 'Cabin',
    };
    return berthMap[berthType] || 'No Data';
  };

  const berthOptions = applicableBerthTypes.map((berthType: string) => ({
    berthName: getBerthDetails(berthType),
    berthValue: berthType,
  }));

  const getidcardvalue = (idcard: any) => {
    const IDCARDvalue: { [key: string]: string } = {
      NULL_IDCARD: 'Select ID Card Type',
      DRIVING_LICENSE: 'DRIVING LICENSE',
      PASSPORT: 'PASSPORT/TRAVEL DOCUMENT',
      PANCARD: 'PAN CARD',
      VOTER_ICARD: 'VOTER ID-CARD',
      GOVT_ICARD: 'GOVT ISSUED ID-CARD',
      STUDENT_ICARD: 'STUDENT ID-CARD',
      BANK_PASSBOOK: 'BANK PASSBOOK',
      CREDIT_CARD: 'CREDIT CARD WITH PHOTO',
      UNIQUE_ICARD: 'AADHAR ID/VIRTUAL ID',
    };
    return IDCARDvalue[idcard] || 'No Data';
  };

  const getfoodvalue = (food: any) => {
    const Foodvalue: { [key: string]: string } = {
      V: 'Veg',
      N: 'Non Veg',
      D: 'No Food',
      J: 'Jain Meal',
      F: 'Veg (Diabetic)',
      G: 'Non Veg (Diabetic)',
      T: 'Tea/Coffee',
      E: 'Evening Snacks (Veg)',
    };
    return Foodvalue[food] || food || 'No Data';
  };

  const IDCardType = validIdCardTypes.map((item: any, index: number) => ({
    idcardname: getidcardvalue(item),
    idCardvalue: item,
  }));

  const foodData = foodDetails.map((item: any, index: number) => ({
    foodname: getfoodvalue(item),
    foodvalue: item,
  }));

  useEffect(() => {
    const filteredBerthOptions = berthOptions.filter(
      (option) => option.berthValue !== 'WS'
    );
    if (Quota === 'SS' && filteredBerthOptions.length > 0) {
      onChange('berth', 'LB');
    }
  }, [Quota]);

  useEffect(() => {
    if (data.nationality !== 'IN' && data.dob) {
      let calculatedAge = calculateAgeByDate(data.dob);
      if (calculatedAge === 0) {
        calculatedAge = 1;
      }
      onChange('age', calculatedAge.toString());
    }
  }, [data.dob]);

  useEffect(() => {
    if (!data.meal && foodChoice === 'true') {
      const mealSelection = CateringDefaultOption === true
        ? foodDetails[0]
        : (foodDetails.includes('D') ? 'D' : foodDetails[0]);
      onChange('meal', mealSelection);
    }
  }, [foodChoice, data.meal]);

  const onDateChange = (event: any, selectedDate?: any) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      const realDate = new Date(selectedDate); // 🔥 convert string/timestamp to Date

      if (isNaN(realDate.getTime())) {
        console.warn("Invalid date received:", selectedDate);
        return;
      }

      const dateString = realDate.toISOString().split('T')[0];
      onChange("dob", dateString);
      handelValidateBlur("dob", dateString);
    }
  };


  useEffect(() => {
    if (
      !localOptBerth &&
      Number(data.age) >= Number(passengerValidation.minPassengerAge) &&
      Number(data.age) <= Number(passengerValidation.maxChildAge)
    ) {
      onChange("berth", ""); // force no preference
    }
  }, [localOptBerth, data.age]);

  // Sync with parent when data.berth changes
  useEffect(() => {
    setLocalBerth(data.berth);
  }, [data.berth]);

  const mustDisableBerth =
    !localOptBerth &&
    Number(data.age) >= Number(passengerValidation.minPassengerAge) &&
    Number(data.age) <= Number(passengerValidation.maxChildAge);

  useEffect(() => {
    if (mustDisableBerth) {
      onChange("berth", "");     // 👈 Force No Preference
    }
  }, [mustDisableBerth]);


  return (
    <ScrollView
      className="flex-1 p-4 bg-white dark:bg-[#0d1117]"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Name */}
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
          Name
        </Text>
        <TextInput
          value={data.name}
          onChangeText={(text) => handleLocalChange('name', text)}
          onBlur={() => handelValidateBlur('name', data.name)}
          className="border border-gray-300 dark:border-[#30363d] px-3 py-2 rounded-md 
                 text-gray-900 dark:text-[#e6edf3] bg-white dark:bg-[#161b22]"
        />
      </View>

      {/* Age + Opt Berth */}
      <View className="flex-row mb-4">
        <View className="flex-1">
          <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
            Age
          </Text>
          <TextInput
            value={data.age}
            keyboardType="numeric"
            onChangeText={(text) => handleLocalChange('age', text)}
            onBlur={() => handelValidateBlur('age', data.age)}
            className="border border-gray-300 dark:border-[#30363d] px-3 py-2 rounded-md 
                   text-gray-900 dark:text-[#e6edf3] bg-white dark:bg-[#161b22]"
          />
        </View>

        {!isChild && (
          <View className="flex-1 ml-3">
            <Text className="text-sm mb-1 text-white">Opt Berth</Text>

            <Switch
              value={localOptBerth}
              disabled={
                passengerValidation.childBerthMandatory === "true" ||
                Number(data?.age) > Number(passengerValidation.maxChildAge) ||
                Number(data?.age) < Number(passengerValidation.minPassengerAge) ||
                data?.age === ""
              }
              onValueChange={(val) => {
                setLocalOptBerth(val);         // ⚡ Fast UI Update
                handleLocalChange("optberth", val); // 🔄 Update Parent
              }}
            />

          </View>
        )}

      </View>

      {/* Gender */}
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
          Gender
        </Text>

        <View
          className="border border-gray-300 dark:border-[#30363d] rounded-md overflow-hidden 
      bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-900"
          style={{ zIndex: 999 }}    // 👈 ADD THIS
        >
          <Picker
            selectedValue={data.gender}
            onValueChange={(val) => handleLocalChange('gender', val)}
            style={{ height: 48 }}    // 👈 IMPORTANT
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="M" />
            <Picker.Item label="Female" value="F" />
            <Picker.Item label="Transgender" value="T" />
          </Picker>
        </View>

      </View>


      {/* Berth Preference */}
      {!isChild && (
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
            {berthOptions.some((option) => option.berthValue === 'WS')
              ? 'Seat Preference'
              : 'Berth Preference'}
          </Text>
          <View
            className={`border rounded-md overflow-hidden text-gray-700 dark:text-gray-900 ${!localOptBerth
              ? 'border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#2d333b]'
              : 'border-gray-300 dark:border-[#30363d] bg-white dark:bg-[#161b22]'
              }`}
          >
            <Picker
              selectedValue={localBerth}               // ⬅ FIXED
              enabled={!mustDisableBerth}
              onValueChange={(value) => {
                if (!mustDisableBerth) {
                  setLocalBerth(value);                // ⬅ Update UI
                  onChange("berth", value);            // ⬅ Update parent
                  handelValidateBlur("berth", value);
                }
              }}
              style={{ height: 48 }}
            >
              <Picker.Item label="No Preference" value="" />
              {berthOptions.map((option, index) => (
                <Picker.Item key={index} label={option.berthName} value={option.berthValue} />
              ))}
            </Picker>



          </View>
        </View>
      )}

      {/* Meal */}
      {!isChild && foodChoice == 'true' && (
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
            Meal
          </Text>
          <View
            className={`border rounded-md overflow-hidden bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-900 ${data.meal == 'D' ? 'border-yellow-500 border-2' : 'border-gray-300 dark:border-[#30363d]'
              }`}
          >
            <Picker
              selectedValue={data.meal}
              onValueChange={(value) => onChange('meal', value)}
              style={{ height: 48 }}
            >
              {foodData.map((item, index) => (
                <Picker.Item key={index} label={item.foodname} value={item.foodvalue} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {/* Bedroll */}
      {!isChild && bedRollFlagEnabled === 'true' && (
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
            Bedroll
          </Text>
          <View className="border border-gray-300 dark:border-[#30363d] rounded-md 
                      overflow-hidden bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-900">
            <Picker
              selectedValue={data.bedroll}
              onValueChange={(value) => onChange('bedroll', value)}
              style={{ height: 48 }}
            >
              <Picker.Item label="Yes" value="true" />
              <Picker.Item label="No" value="false" />
            </Picker>
          </View>
        </View>
      )}

      {/* Nationality */}
      {!isChild && (
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
            Nationality
          </Text>
          <View className="border border-gray-300 dark:border-[#30363d] rounded-md 
                      overflow-hidden bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-900">
            <Picker
              selectedValue={data.nationality}
              onValueChange={(value) => onChange('nationality', String(value))}
              style={{ height: 48, maxHeight: 160 }}  // 🔥 FIX for white blank area
            >
              {countryLists.map((c, i) => (
                <Picker.Item key={i} label={c.country} value={c.countryCode} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {/* DOB */}
      {!isChild && data.nationality !== "IN" && (
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
            Date Of Birth
          </Text>
          <DateInput
            date={dob ? new Date(dob) : new Date()}
            minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 125))}
            setDate={(selectedDate) => {
              const finalDate = selectedDate.toString().split("T")[0];

              setFinalDate(finalDate);

              handleLocalChange("dob", finalDate);   // now mapped → psgnConcDOB
              handelValidateBlur("dob", finalDate);

              setShowDatePicker(false);
            }}

          />

        </View>
      )}

      {/* ID Cards */}
      {!isChild && data.nationality !== 'IN' && !bonafideCountryList.includes(data.nationality) && (
        <>
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
              ID Card Type
            </Text>

            <View
              className="border border-gray-300 dark:border-[#30363d] rounded-md 
               bg-gray-100 dark:bg-[#2d333b] overflow-hidden"
            >
              <Picker
                selectedValue={data.idCardType}   // must match item.idCardvalue
                enabled={!bonafideCountryList.includes(data.nationality)}
                style={{ height: 48 }}
                onValueChange={(val) => onChange("idCardType", val)}   // 🔥 MUST update parent
              >
                {IDCardType.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={item.idcardname}     // label shown to user
                    value={item.idCardvalue}    // actual stored value
                  />
                ))}
              </Picker>

            </View>
          </View>


          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-[#e6edf3]">
              ID Number
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-[#30363d] rounded-md 
                     px-3 py-3 text-sm bg-white dark:bg-[#161b22] 
                     text-gray-900 dark:text-[#e6edf3]"
              placeholder="Enter ID Number"
              placeholderTextColor="#888"
              value={data.idNumber}
              onChangeText={(text) => onChange('idNumber', text)}
              onBlur={() => handelValidateBlur('idNumber', data.idNumber)}
            />
          </View>
        </>
      )}

      {/* Info Texts */}
      {!localOptBerth &&
        parseInt(data.age) >= parseInt(passengerValidation.minPassengerAge) &&
        parseInt(data.age) <= parseInt(passengerValidation.maxChildAge) && (
          <Text className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
            No berth will be allotted for child and half of the adult fare will be charged.
          </Text>
        )}

      {localOptBerth &&
        parseInt(data.age) >= parseInt(passengerValidation.minPassengerAge) &&
        parseInt(data.age) <= parseInt(passengerValidation.maxChildAge) && (
          <Text className="text-green-600 dark:text-[#4ade80] text-xs mt-2">
            Berth will be allotted for child and full adult fare will be charged.
          </Text>
        )}

      <Toast />
    </ScrollView>

  );
};

export default PassengerInputRow;