import { gql } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
        id
        email
        password
        firstName
        lastName
        number
        profilePicture
        createdAt
    }
  }
`;