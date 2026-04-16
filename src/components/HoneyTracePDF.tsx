import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";
import { TraceResponse } from "@/services/traceabilityService";
import {
  buildConservationFacts,
  buildDeepTraceabilityStory,
  buildHarvestFacts,
  buildSensorFacts,
  buildWeatherFacts,
  formatTraceDate,
  formatTraceText,
  hasTraceValue,
} from "@/lib/traceabilityNarrative";
import { ApiaryWeatherSummary } from "@/services/beeyieldService";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#fffdf8",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
    paddingBottom: 14,
    marginBottom: 18,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#b45309",
  },
  brandSub: {
    fontSize: 9,
    color: "#6b7280",
  },
  badge: {
    backgroundColor: "#065f46",
    color: "#ecfdf5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "bold",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  heroSub: {
    color: "#6b7280",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  col: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  darkSection: {
    backgroundColor: "#052e2b",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#92400e",
  },
  darkTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fef3c7",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#ffedd5",
  },
  darkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#134e4a",
  },
  label: {
    width: "42%",
    color: "#78716c",
    fontSize: 9,
    fontWeight: "bold",
  },
  value: {
    width: "58%",
    textAlign: "right",
    fontSize: 9,
  },
  darkLabel: {
    width: "42%",
    color: "#99f6e4",
    fontSize: 9,
    fontWeight: "bold",
  },
  darkValue: {
    width: "58%",
    textAlign: "right",
    fontSize: 9,
    color: "#f9fafb",
  },
  beekeeperWrap: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  beekeeperPhoto: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  beekeeperName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  beekeeperMeta: {
    fontSize: 9,
    color: "#ccfbf1",
    marginTop: 2,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  darkParagraph: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
    color: "#ecfeff",
  },
  timelineItem: {
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  timelineTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  timelineMeta: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 2,
  },
});

interface HoneyTracePDFProps {
  traceData: TraceResponse;
  weatherSummary?: ApiaryWeatherSummary | null;
}

const renderRows = (
  rows: Array<{ label: string; value: string }>,
  dark = false,
) =>
  rows.map((item) => (
    <View key={item.label} style={dark ? styles.darkRow : styles.row}>
      <Text style={dark ? styles.darkLabel : styles.label}>{item.label}</Text>
      <Text style={dark ? styles.darkValue : styles.value}>{item.value}</Text>
    </View>
  ));

const HoneyTracePDF = ({ traceData, weatherSummary }: HoneyTracePDFProps) => {
  const generatedDate = formatTraceDate(new Date().toISOString());
  const storyParagraphs = buildDeepTraceabilityStory(traceData);
  const harvestFacts = buildHarvestFacts(traceData);
  const conservationFacts = buildConservationFacts(traceData);
  const sensorFacts = buildSensorFacts(traceData);
  const weatherFacts = buildWeatherFacts(traceData, weatherSummary);
  const beekeeperPhoto = traceData.farmer?.photo_url || TIMOTHY_PHOTO;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image src={BEEYIELD_LOGO} style={styles.logo} />
            <View>
              <Text style={styles.brandTitle}>BeeYield</Text>
              <Text style={styles.brandSub}>Traceability and Conservation Certificate</Text>
            </View>
          </View>
          <Text style={styles.badge}>{formatTraceText(traceData.verification_status, "Verified")}</Text>
        </View>

        <Text style={styles.heroTitle}>Honey Traceability Scan Document</Text>
        <Text style={styles.heroSub}>
          Batch {formatTraceText(traceData.batch_code)} | Generated {generatedDate}
        </Text>

        <View style={styles.grid}>
          <View style={styles.col}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specific Harvest Record</Text>
              {renderRows(harvestFacts)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sensor Readings</Text>
              {renderRows(sensorFacts)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weather Record</Text>
              {renderRows(weatherFacts)}
            </View>
          </View>

          <View style={styles.col}>
            <View style={styles.darkSection}>
              <Text style={styles.darkTitle}>Farmer and Apiary Steward</Text>
              <View style={styles.beekeeperWrap}>
                <Image src={beekeeperPhoto} style={styles.beekeeperPhoto} />
                <View>
                  <Text style={styles.beekeeperName}>{formatTraceText(traceData.farmer?.name, "Timothy Nduva")}</Text>
                  <Text style={styles.beekeeperMeta}>
                    Apiary: {formatTraceText(traceData.apiary?.name)}
                  </Text>
                  <Text style={styles.beekeeperMeta}>
                    Hive: {formatTraceText(traceData.hive?.hive_code)}
                  </Text>
                  <Text style={styles.beekeeperMeta}>
                    Location: {formatTraceText(traceData.apiary?.location_name || traceData.farmer?.location_name)}
                  </Text>
                </View>
              </View>
              <Text style={styles.darkParagraph}>
                {formatTraceText(traceData.farmer?.story || traceData.story_content)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>50/50 Journey and ESG</Text>
              {renderRows(conservationFacts)}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Honey Journey Timeline</Text>
          {traceData.timeline.map((step) => (
            <View key={`${step.title}-${step.date}`} style={styles.timelineItem}>
              <Text style={styles.timelineTitle}>{step.title}</Text>
              <Text style={styles.timelineMeta}>
                {formatTraceText(step.location)} | {formatTraceText(step.date)}
              </Text>
              <Text style={styles.paragraph}>{formatTraceText(step.description)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BeeYield | Kibwezi, Makueni County, Kenya</Text>
          <Text style={styles.footerText}>This certificate shows actual batch-linked fields and live weather only when available from backend or provider sources.</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image src={BEEYIELD_LOGO} style={styles.logo} />
            <View>
              <Text style={styles.brandTitle}>BeeYield Story</Text>
              <Text style={styles.brandSub}>Conservation, restoration, and transparent harvesting</Text>
            </View>
          </View>
          <Text style={styles.badge}>ESG</Text>
        </View>

        <View style={styles.darkSection}>
          <Text style={styles.darkTitle}>Our Story in Depth</Text>
          {storyParagraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.darkParagraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Traceability Notes</Text>
          <Text style={styles.paragraph}>
            Farmer: {formatTraceText(traceData.farmer?.name)}. Apiary: {formatTraceText(traceData.apiary?.name)}. Hive: {formatTraceText(traceData.hive?.hive_code)}. Harvest date: {formatTraceDate(traceData.harvest_date)}.
          </Text>
          <Text style={styles.paragraph}>
            Florage: {formatTraceText(traceData.apiary?.flora_types?.join(", ") || traceData.florage_type)}. Verification status: {formatTraceText(traceData.verification_status)}. Completeness: {formatTraceText(traceData.completeness?.status)}.
          </Text>
          <Text style={styles.paragraph}>
            Sensor source time: {formatTraceDate(traceData.sensor_snapshot?.sync_time)}. Weather observation time: {formatTraceDate(weatherSummary?.current?.last_observed_at)}.
          </Text>
        </View>

        {hasTraceValue(weatherSummary?.daily_summary) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apiary Weather Summary</Text>
            {renderRows([
              { label: "Condition", value: formatTraceText(weatherSummary?.daily_summary?.condition) },
              { label: "High", value: formatTraceText((weatherSummary?.daily_summary as Record<string, unknown> | undefined)?.temp_max_c) },
              { label: "Low", value: formatTraceText((weatherSummary?.daily_summary as Record<string, unknown> | undefined)?.temp_min_c) },
              { label: "Sunrise", value: formatTraceDate((weatherSummary?.daily_summary as Record<string, unknown> | undefined)?.sunrise_at) },
              { label: "Sunset", value: formatTraceDate((weatherSummary?.daily_summary as Record<string, unknown> | undefined)?.sunset_at) },
            ])}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>BeeYield commitment: trace every jar, protect every colony, and document conservation work with accountable records.</Text>
          <Text style={styles.footerText}>www.beeyield.com/trace</Text>
        </View>
      </Page>
    </Document>
  );
};

export default HoneyTracePDF;
