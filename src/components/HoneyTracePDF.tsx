import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import BEEYIELD_LOGO from '@/assets/Logo.png';
import TIMOTHY_PHOTO from '@/assets/timothy-nduva.png';
import { TraceResponse, TraceJourneyStep } from '@/services/traceabilityService';

// Font registration disabled for safe mode compatibility

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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 50,
        height: 50,
        marginRight: 12,
    },
    logoTextContainer: {
        flexDirection: 'column',
    },
    logo: {
        fontSize: 24,
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
        paddingVertical: 6,
        paddingHorizontal: 12,
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
    beekeeperHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    beekeeperPhoto: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
        borderWidth: 3,
        borderColor: '#F59E0B',
    },
    beekeeperInfo: {
        flex: 1,
    },
    beekeeperName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    beekeeperTitle: {
        fontSize: 10,
        color: '#FCD34D',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    beekeeperLocation: {
        fontSize: 10,
        color: '#C7D2FE',
        marginTop: 4,
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
        fontFamily: 'Helvetica',
        marginTop: 2,
    },
    floraTag: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        fontSize: 9,
        paddingVertical: 3,
        paddingHorizontal: 8,
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
        marginBottom: 4,
    },
    footerContact: {
        fontSize: 8,
        color: '#6B7280',
        marginBottom: 2,
    },
    qrNote: {
        fontSize: 8,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
    },
    impactSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#FEF9C3',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EAB308',
    },
    impactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    impactItem: {
        width: '50%',
        marginBottom: 8,
    },
    impactLabel: {
        fontSize: 8,
        color: '#78350F',
        textTransform: 'uppercase',
    },
    impactValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
});

interface HoneyTracePDFProps {
    traceData: TraceResponse;
}

const HoneyTracePDF = ({ traceData }: HoneyTracePDFProps) => {
    if (!traceData) return null;

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
                {/* Header with BeeYield Logo */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image src={BEEYIELD_LOGO} style={styles.logoImage} />
                        <View style={styles.logoTextContainer}>
                            <Text style={styles.logo}>BeeYield</Text>
                            <Text style={styles.logoSubtext}>HoneyChain Traceability Certificate</Text>
                        </View>
                    </View>
                    <Text style={styles.badge}>VERIFIED</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Honey Traceability Certificate</Text>
                <Text style={styles.subtitle}>
                    Batch Code: {traceData.batch_code} | Generated: {generatedDate}
                </Text>

                {/* Origin Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Origin Details</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Batch Identifier:</Text>
                        <Text style={styles.value}>{traceData.batch_code}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Product Name:</Text>
                        <Text style={styles.value}>{traceData.product_name}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Apiary Name:</Text>
                        <Text style={styles.value}>{traceData.apiary?.name || 'Kibwezi Savanna Apiary'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>
                            Kibwezi, Makueni County, Kenya
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Harvest Date:</Text>
                        <Text style={styles.value}>
                            {traceData.timeline?.find((t: TraceJourneyStep) => t.title === 'Harvested')?.date || 'Unknown'}
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

                {/* Beekeeper Section with Photo */}
                <View style={styles.beekeeperSection}>
                    <Text style={[styles.sectionTitle, { color: '#FCD34D' }]}>Master Beekeeper</Text>
                    <View style={styles.beekeeperHeader}>
                        <Image src={TIMOTHY_PHOTO} style={styles.beekeeperPhoto} />
                        <View style={styles.beekeeperInfo}>
                            <Text style={styles.beekeeperName}>Timothy Nduva</Text>
                            <Text style={styles.beekeeperTitle}>Certified Master Beekeeper</Text>
                            <Text style={styles.beekeeperLocation}>Location: Kibwezi, Makueni County</Text>
                            <Text style={styles.beekeeperLocation}>15+ Years Experience</Text>
                        </View>
                    </View>
                    <Text style={styles.beekeeperStory}>
                        "{traceData.farmer?.story || 'Timothy Nduva is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production. With 15 years of experience, he manages multiple apiaries across Makueni County, mentoring young beekeepers and championing the 50/50 harvest promise.'}"
                    </Text>
                </View>

                {/* Impact Stats */}
                {traceData.impact_stats && (
                    <View style={styles.impactSection}>
                        <Text style={styles.sectionTitle}>Environmental Impact</Text>
                        <View style={styles.impactGrid}>
                            <View style={styles.impactItem}>
                                <Text style={styles.impactLabel}>Acres Pollinated</Text>
                                <Text style={styles.impactValue}>{traceData.impact_stats.acres_pollinated || '25+'}</Text>
                            </View>
                            <View style={styles.impactItem}>
                                <Text style={styles.impactLabel}>Total Honey (kg)</Text>
                                <Text style={styles.impactValue}>{traceData.impact_stats.total_honey_kg || '883'}</Text>
                            </View>
                            <View style={styles.impactItem}>
                                <Text style={styles.impactLabel}>Hive Count</Text>
                                <Text style={styles.impactValue}>{traceData.impact_stats.hive_count || '24'}</Text>
                            </View>
                            <View style={styles.impactItem}>
                                <Text style={styles.impactLabel}>Farmers Served</Text>
                                <Text style={styles.impactValue}>{traceData.impact_stats.farmers_served || '12'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Sensor Data */}
                {traceData.sensor_snapshot && (
                    <View style={styles.sensorGrid}>
                        <Text style={[styles.sectionTitle, { color: '#FFFFFF', width: '100%' }]}>
                            Hive Intelligence (at Harvest)
                        </Text>

                        <View style={styles.sensorItem}>
                            <Text style={styles.sensorLabel}>Temperature</Text>
                            <Text style={styles.sensorValue}>{traceData.sensor_snapshot.avg_temp} C</Text>
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
                        <Text style={styles.sectionTitle}>The Honey Journey</Text>

                        {traceData.timeline.map((step: TraceJourneyStep, idx: number) => (
                            <View key={idx} style={styles.timelineItem}>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>{step.title}</Text>
                                    <Text style={styles.timelineDate}>{step.date}</Text>
                                    <Text style={styles.timelineDesc}>{step.description}</Text>
                                    <Text style={styles.timelineLocation}>Location: {step.location}</Text>
                                    {step.hash && (
                                        <Text style={styles.timelineHash}>Hash: {step.hash.substring(0, 24)}...</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer with BeeYield Contact Info */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This certificate verifies the authenticity and traceability of your honey on HoneyChain
                    </Text>
                    <Text style={styles.footerHighlight}>
                        BeeYield - Champions for Saving Bees | 50% Ethical Harvest Promise
                    </Text>
                    <Text style={styles.footerContact}>
                        Email: info@beeyield.com | Phone: +1 (800) 123-4567 | Web: www.beeyield.com
                    </Text>
                    <Text style={styles.footerContact}>
                        Kibwezi, Makueni County, Kenya
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
