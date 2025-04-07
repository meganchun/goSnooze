import React, { useState } from "react";
import {
  TextInput,
  KeyboardTypeOptions,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Colours } from "../../constants/Colours";
import { ThemedText } from "./ThemedText";
interface Props {
  value: string | undefined;
  setValue: (value: string | undefined) => void;
  className?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  textContentType?:
    | "none"
    | "URL"
    | "addressCity"
    | "addressCityAndState"
    | "addressState"
    | "countryName"
    | "creditCardNumber"
    | "creditCardExpiration"
    | "creditCardExpirationMonth"
    | "creditCardExpirationYear"
    | "creditCardSecurityCode"
    | "creditCardType"
    | "creditCardName"
    | "creditCardGivenName"
    | "creditCardMiddleName"
    | "creditCardFamilyName"
    | "emailAddress"
    | "familyName"
    | "fullStreetAddress"
    | "givenName"
    | "jobTitle"
    | "location"
    | "middleName"
    | "name"
    | "namePrefix"
    | "nameSuffix"
    | "nickname"
    | "organizationName"
    | "postalCode"
    | "streetAddressLine1"
    | "streetAddressLine2"
    | "sublocality"
    | "telephoneNumber"
    | "username"
    | "password"
    | "newPassword"
    | "oneTimeCode";
  maxLength?: number;
  warning?: string;
}

export default function TextEntry({
  value,
  setValue,
  className,
  placeholder,
  keyboardType,
  textContentType,
  maxLength,
  warning = undefined,
}: Props) {
  const [isVisible, setIsVisible] = useState(!(textContentType === "password"));

  return (
    <View className="container relative h-auto bg-[#00000]">
      <ThemedText
        type="description"
        style={{
          color: Colours.constant.danger,
        }}
      >
        {warning}
      </ThemedText>
      <View>
        <TextInput
          className="border border-[#D9D9D9] rounded relative"
          returnKeyType="next"
          value={value}
          placeholder={placeholder}
          onChangeText={setValue}
          autoCapitalize="none"
          textContentType={textContentType}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={{
            width: textContentType === "oneTimeCode" ? 36 : "auto",
            height: textContentType === "oneTimeCode" ? 48 : "auto",
            paddingHorizontal: textContentType === "oneTimeCode" ? 0 : 10,
            paddingVertical: textContentType === "oneTimeCode" ? 0 : 12,
            textAlign: textContentType === "oneTimeCode" ? "center" : "left",
            borderColor: warning ? Colours.constant.danger : "#D9D9D9",
            fontFamily: "DMSans_400Regular",
          }}
          secureTextEntry={!isVisible}
        />
        {textContentType === "password" && (
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            className="absolute right-4 bottom-1/2 translate-y-[9px]"
          >
            {isVisible ? (
              <Icon name="eye-off" size={18} color="#D9D9D9" />
            ) : (
              <Icon name="eye" size={18} color="#D9D9D9" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
