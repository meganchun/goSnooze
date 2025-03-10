import React from "react";
import { TextInput, KeyboardTypeOptions } from "react-native";
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
}

export default function TextEntry({
  value,
  setValue,
  className,
  placeholder,
  keyboardType,
  textContentType,
}: Props) {
  return (
    <TextInput
      className="border border-[#D9D9D9] p-4 rounded"
      returnKeyType="next"
      value={value}
      placeholder={placeholder}
      onChangeText={setValue}
      autoCapitalize="none"
      textContentType={textContentType}
      keyboardType={keyboardType}
    />
  );
}
