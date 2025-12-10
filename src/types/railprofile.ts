interface Id {
  $oid: string;
}


interface AgentRegistration {
  companyName: string;
  pancardNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
}

interface OfficeAddress {
  address: string;
  country: string;
  pincode: string;
  state: string;
  city: string;
  postOffice: string;
  officePhone: string;
  whatsAppNumber: string;
}

interface ResidentialAddress {
  residentialAddress: string;
  residentialCountry: string;
  residentialPincode: string;
  residentialState: string;
  residentialCity: string;
  residentialPostOffice: string;
  residentialPhone: string;
  personalWhatsapp: string;
}

interface Document {
  key: string;
  url: string;
}

interface Documents {
  panCard: Document;
  officialAddressProof: Document;
  residentialAdressProof: Document;
  photograph: Document;
  dcFileName: Document;
}

interface DeviceDetails {
  deviceType: string;
  deviceSerialNumber: string;
  deviceTypeMobile: string;
  imeiNumber: string;
  subjectCommonName: string;
  issuerCommonName: string;
  DCserialNumber: string;
  validityNotBefore: string;
  validityNotAfter: string;
}

interface Profile {
  userID: string;
  refID: string;
  ownerID: string;
  status: string;
  email: string;
  agencyName: string;
  updatedAt: string;
  createdAt: string;
}

export interface Udf {
  [key: string]: string;
}


export interface RailProfileTypes {
  _id: Id;
  userID: string;
  ownerID: string;
  wsUserLogin: string;
  refID: string;
  processedon: string;
  UniqueEmail: string;
  uniqueMobileNumber: string;
  status: string;
  OTP_flag: boolean;
  OTP_Left: number;
  IRCTC_Enable: string;
  IRCTC_Verified: string;
  ADMIN_Enable: string;
  PARTNER_Enable: string;
  oldContacts: any[]; // Assuming this can be any type of array
  agentRegistration: AgentRegistration;
  officeAddress: OfficeAddress;
  residentialAddress: ResidentialAddress;
  documents: Documents;
  deviceDetails: DeviceDetails;
  urltype: string;
  deleted: boolean;
  transferFrom: string;
  transferTo: string;
  transferComment: string;
  transferAt: string;
  profile?: Profile;
  OTP_Begin_Date: string;
  OTP_End_Date: string;
  ID_ExpireDate: string;
  renewalDate: string;
  Pnotes: string;
  AGnotes: string;
  Expiry_message: string;
  udf: Udf;
  rejectionReason: string;
  allowedSearchTypes: number[];
}