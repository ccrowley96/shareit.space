import { gql } from '@apollo/client';

export const JOIN_COMMUNITY = gql`
    mutation joinCommunity($code: String!){
        joinCommunity(code: $code){
            code
            success
            message
            community{
                name
            }
        }
    }
`;

export const CREATE_COMMUNITY = gql`
    mutation addNewCommunity($name: String!, $description: String){
        addCommunity(name: $name, description: $description){
            code
            success
            message
            community{
                name
            }
        }
    }
`;


export const MY_COMMUNITIES = gql`
    query myCommunities{
        myCommunities{
            name
            code
            description
            id
            rooms{
                id
                name
            }
            members{
                name
                email
            }
            admins{
                name
            }
        }
    }
`;