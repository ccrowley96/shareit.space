import { InMemoryCache, makeVar } from '@apollo/client'

export const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                activeCommunityId: {
                    read() {
                        return activeCommunityIdVar();
                    }
                },
                activeRoomId: {
                    read() {
                        return activeRoomIdVar();
                    }
                }
            }
        }
    }
})

export const activeCommunityIdVar = makeVar(localStorage.getItem('activeCommunityId'));
export const activeRoomIdVar = makeVar(null);