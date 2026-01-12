import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts (optional - using system fonts)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
    ],
});

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#F59E0B',
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    logoSubtext: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
    },
    badge: {
        backgroundColor: '#10B981',
        color: '#FFFFFF',
        padding: '6 12',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    section: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FCD34D',
        paddingBottom: 6,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: '40%',
        fontSize: 11,
        color: '#6B7280',
        fontWeight: 'bold',
    },
    value: {
        width: '60%',
        fontSize: 11,
        color: '#1F2937',
    },
    beekeeperSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#312E81',
        borderRadius: 8,
        color: '#FFFFFF',
    },
    beekeeperName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    beekeeperStory: {
        fontSize: 10,
        color: '#C7D2FE',
        fontStyle: 'italic',
        lineHeight: 1.5,
        marginTop: 10,
    },
    sensorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#1F2937',
        borderRadius: 8,
    },
    sensorItem: {
        width: '50%',
        marginBottom: 12,
    },
    sensorLabel: {
        fontSize: 9,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    sensorValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    sensorStatus: {
        fontSize: 8,
        color: '#10B981',
        marginTop: 2,
    },
    timelineSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingLeft: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#F59E0B',
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 2,
    },
    timelineDesc: {
        fontSize: 10,
        color: '#4B5563',
        lineHeight: 1.4,
    },
    timelineLocation: {
        fontSize: 9,
        color: '#9CA3AF',
        marginTop: 4,
    },
    timelineHash: {
        fontSize: 7,
        color: '#9CA3AF',
        fontFamily: 'Courier',
        marginTop: 2,
    },
    floraTag: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        fontSize: 9,
        padding: '3 8',
        borderRadius: 10,
        marginRight: 5,
    },
    floraContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerText: {
        fontSize: 9,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    footerHighlight: {
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: 'bold',
    },
    qrNote: {
        fontSize: 8,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
    },
});

interface HoneyTracePDFProps {
    traceData: any;
}

const HoneyTracePDF = ({ traceData }: HoneyTracePDFProps) => {
    const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>🐝 BeeYield</Text>
                        <Text style={styles.logoSubtext}>HoneyChain™ Traceability Certificate</Text>
                    </View>
                    <Text style={styles.badge}>✓ VERIFIED</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Honey Traceability Report</Text>
                <Text style={styles.subtitle}>
                    Batch Code: {traceData.batch_code} | Generated: {generatedDate}
                </Text>

                {/* Origin Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Origin Details</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Batch Identifier:</Text>
                        <Text style={styles.value}>{traceData.batch_code}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Apiary Name:</Text>
                        <Text style={styles.value}>{traceData.apiary?.name || 'Kibwezi Savannah'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>
                            {traceData.apiary?.location_name}, {traceData.apiary?.county}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Harvest Date:</Text>
                        <Text style={styles.value}>
                            {traceData.timeline?.find((t: any) => t.title === 'Harvested')?.date || 'Unknown'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Flora Sources:</Text>
                        <View style={styles.floraContainer}>
                            {traceData.apiary?.flora_types && traceData.apiary.flora_types.length > 0 ? (
                                traceData.apiary.flora_types.map((flora: string, idx: number) => (
                                    <Text key={idx} style={styles.floraTag}>{flora}</Text>
                                ))
                            ) : (
                                <Text style={styles.value}>Acacia, Wildflower</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Beekeeper Section */}
                <View style={styles.beekeeperSection}>
                    <Text style={styles.sectionTitle}>👨‍🌾 Master Beekeeper</Text>
                    <Text style={styles.beekeeperName}>{traceData.farmer?.name || 'Certified Guardian'}</Text>
                    <Text style={styles.beekeeperStory}>
                        "{traceData.farmer?.story || 'Dedicated beekeeper committed to sustainable practices.'}"
                    </Text>
                </View>

                {/* Sensor Data */}
                {traceData.sensor_snapshot && (
                    <View style={styles.sensorGrid}>
                        <Text style={{ ...styles.sectionTitle, color: '#FFFFFF', width: '100%' }}>
                            📊 Hive Intelligence (at Harvest)
                        </Text>

                        <View style={styles.sensorItem}>
                            <Text style={styles.sensorLabel}>Temperature</Text>
                            <Text style={styles.sensorValue}>{traceData.sensor_snapshot.avg_temp}°C</Text>
                            <Text style={styles.sensorStatus}>OPTIMAL</Text>
                        </View>

                        <View style={styles.sensorItem}>
                            <Text style={styles.sensorLabel}>Humidity</Text>
                            <Text style={styles.sensorValue}>{traceData.sensor_snapshot.avg_humidity}%</Text>
                            <Text style={styles.sensorStatus}>STABLE</Text>
                        </View>

                        <View style={styles.sensorItem}>
                            <Text style={styles.sensorLabel}>Acoustic Health</Text>
                            <Text style={styles.sensorValue}>{traceData.sensor_snapshot.acoustic_health}</Text>
                            <Text style={styles.sensorStatus}>Active Queen Pattern</Text>
                        </View>

                        <View style={styles.sensorItem}>
                            <Text style={styles.sensorLabel}>Hive Weight</Text>
                            <Text style={styles.sensorValue}>{traceData.sensor_snapshot.weight_kg}kg</Text>
                            <Text style={styles.sensorStatus}>Productivity Peak</Text>
                        </View>
                    </View>
                )}

                {/* Journey Timeline */}
                {traceData.timeline && traceData.timeline.length > 0 && (
                    <View style={styles.timelineSection}>
                        <Text style={styles.sectionTitle}>🍯 The Honey Journey</Text>

                        {traceData.timeline.map((step: any, idx: number) => (
                            <View key={idx} style={styles.timelineItem}>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>{step.title}</Text>
                                    <Text style={styles.timelineDate}>{step.date}</Text>
                                    <Text style={styles.timelineDesc}>{step.description}</Text>
                                    <Text style={styles.timelineLocation}>📍 {step.location}</Text>
                                    {step.hash && (
                                        <Text style={styles.timelineHash}>Hash: {step.hash.substring(0, 24)}...</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This certificate verifies the authenticity and traceability of your honey on HoneyChain™
                    </Text>
                    <Text style={styles.footerHighlight}>
                        BeeYield - Champions for Saving Bees | 50% Ethical Harvest Promise
                    </Text>
                    <Text style={styles.qrNote}>
                        Scan the QR code on your jar or visit beeyield.com/trace to verify anytime
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default HoneyTracePDF;
