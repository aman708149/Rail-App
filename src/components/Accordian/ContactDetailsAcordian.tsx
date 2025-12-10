import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// if (Platform.OS === 'android') {
//   UIManager.setLayoutAnimationEnabledExperimental &&
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

interface AccordionItemProps {
  id: string;
  header: React.ReactNode;      // ✅ allow JSX or string
  body: React.ReactNode;
}

interface ContactDetailsAccordionProps {
  items: AccordionItemProps[];
  activeId?: string | string[];
  onToggle?: (id: string) => void;
}

const ContactDetailsAccordion: React.FC<ContactDetailsAccordionProps> = ({
  items,
  activeId,
  onToggle,
}) => {
  const [open, setOpen] = useState<string>('');

   useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle?.(id);
    setOpen(open === id ? '' : id);
  };

  useEffect(() => {
    if (Array.isArray(activeId)) {
      setOpen(activeId[0]);   // take first if multiple
    } else if (typeof activeId === "string") {
      setOpen(activeId);
    }
  }, [activeId]);


  return (
    <View className="mt-2">
      {items.map((item) => {
        const isOpen = open === item.id;

        return (
          <View
            key={item.id}
            className="mb-3 rounded-lg border border-gray-700 bg-gray-900"
          >
            {/* HEADER */}
            <TouchableOpacity
              onPress={() => toggle(item.id)}
              className="p-3 bg-gray-800 flex-row justify-between items-center"
            >
              {/* LEFT: header (string or JSX) */}
              {typeof item.header === 'string' ? (
                <Text className="text-gray-200 text-base font-semibold">
                  {item.header}
                </Text>
              ) : (
                item.header
              )}

              {/* RIGHT: dropdown icon */}
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

            {/* BODY */}
            {isOpen && (
              <View className="p-3 bg-gray-900">
                {typeof item.body === 'string' ? (
                  <Text className="text-gray-300">{item.body}</Text>
                ) : (
                  item.body
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ContactDetailsAccordion;
