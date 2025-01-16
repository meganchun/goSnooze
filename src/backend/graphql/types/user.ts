import { gql } from '@apollo/client';

export type userDTO = {
    id: Number;
    email: String;
    password: String;
    firstName: String;
    lastName: String;
    number: String;
    profilePicture?: String
    created: Date;
}