// import { AccordionItemData } from './AccordionItemData';

export interface AccordionProps {
    items: AccordionItemData[];
    setActiveid?: string;
    onToggle?: (id: string) => void;
}

interface AccordionItemData {
    id: string;
    header: string | React.ReactNode; // Allow string or React element
    body: React.ReactNode;
}
