import { useStore } from 'zustand';
import { activeEventStore } from './stores';
import { Text } from '@/components/nativewindui/Text';
import { NDKKind } from '@nostr-dev-kit/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import * as User from '@/ndk-expo/components/user';
import { Dimensions, View, ScrollView } from 'react-native';
import Image from '@/components/media/image';
import RelativeTime from './components/relative-time';
import EventContent from '@/ndk-expo/components/event/content';

function getUrlFromEvent(event: NDKEvent) {
    let url = event.tagValue('thumb') || event.tagValue('url') || event.tagValue('u');

    // if this is a kind:1 see if there is a URL in the content that ends with .jpg, .jpeg, .png, .gif, .webp
    if (!url && event.kind === NDKKind.Text) {
        const content = event.content;
        const urlMatch = content.match(/https?:\/\/[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|webp)/i);
        if (urlMatch) {
            url = urlMatch[0];
        }
    }

    return url;
}

export default function ViewScreen() {
    const activeEvent = useStore(activeEventStore, (state) => state.activeEvent);

    if (!activeEvent) {
        return <Text>No active event</Text>;
    }

    const url = getUrlFromEvent(activeEvent);
    let content = activeEvent.content;

    // remove url from content
    if (url) {
        content = content.replace(url, '');
    }

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="flex-1">
                {/* Header with user info */}
                <View className="flex-row items-center border-b border-gray-800 p-4">
                    <User.Profile pubkey={activeEvent.pubkey}>
                        <User.Avatar className="h-8 w-8 rounded-full" alt={activeEvent.pubkey} />
                        <View className="ml-3">
                            <User.Name className="font-bold text-white" />
                            <Text className="text-sm text-gray-400">
                                <RelativeTime timestamp={activeEvent.created_at} />
                            </Text>
                        </View>
                    </User.Profile>
                </View>

                {/* Image */}
                <ScrollView minimumZoomScale={1} maximumZoomScale={5}>
                    <Image
                        event={activeEvent}
                        style={{
                            width: Dimensions.get('window').width,
                            minHeight: Dimensions.get('window').height * 0.6,
                            flex: 1,
                        }}
                        transition={200}
                    />
                </ScrollView>

                {/* Content */}
                <View className="p-4">
                    <EventContent event={activeEvent} content={content} className="text-sm text-white" />
                </View>
            </View>
        </ScrollView>
    );
}
