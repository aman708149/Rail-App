import {
  Search,
  Eye,
  Ticket,
  ClipboardList,
  X,
  Repeat,
  FileText,
  RefreshCw,
  Calendar,
  CalendarDays,
  User,
  Settings
} from "lucide-react-native";

export const railMenu = [
  { title: "Search Train", route: "/rail/searchTrain", icon: Search },
  { title: "Birdeye View", route: "/rail/rail-birdeye-view", icon: Eye },
  { title: "Rail Bookings", route: "/rail/railbookings", icon: Ticket },
  { title: "Rail Requisitions", route: "/rail/requisitions", icon: ClipboardList },
  { title: "Rail Cancellation", route: "/rail/cancellation", icon: X },
  { title: "Boarding Change", route: "/rail/boarding-change", icon: Repeat },
  { title: "Rail TDR File", route: "/rail/tdr-file", icon: FileText },
  { title: "Rail Refunds", route: "/rail/refunds", icon: RefreshCw },
  { title: "PNR Status", route: "/rail/pnr-status", icon: User },
  { title: "Travel Calendar", route: "/rail/travel-calendar", icon: Calendar },
  { title: "Availability Calendar", route: "/rail/avail-calendar", icon: CalendarDays },
  { title: "Rail Profile", route: "/rail/profile", icon: User },
  { title: "Rail Settings", route: "/rail/settings", icon: Settings }
];
