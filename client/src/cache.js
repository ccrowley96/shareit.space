import { InMemoryCache, makeVar } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

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
                },
                feed: relayStylePagination()
            }
        }
    }
});

export const activeCommunityIdVar = makeVar(
    localStorage.getItem('activeCommunityId')
);
export const activeRoomIdVar = makeVar(null);
