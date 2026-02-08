import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Footer = () => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 6) }]}> 
            <Text style={styles.text}>© CoPiloto by GhersonSA. 2025.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 100,
    },
    text: {
        color: '#6b7280',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default Footer;