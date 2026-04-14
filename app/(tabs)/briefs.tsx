import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';

interface PolicyBrief {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  status: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
}

const BRIEFS: PolicyBrief[] = [
  {
    id: '1',
    title: 'Borno State Crisis Response',
    severity: 'critical',
    status: 'Published',
    summary: 'Comprehensive analysis of the ongoing humanitarian crisis in Borno State, focusing on displacement patterns, conflict hotspots, and resource allocation gaps.',
    keyPoints: [
      'Over 1.8M internally displaced persons in Borno alone',
      'Conflict incidents concentrated in 8 high-risk LGAs',
      'Healthcare infrastructure critically understaffed',
      'Education disruption affecting 65% of school-age children',
    ],
    recommendations: [
      'Increase mobile health units in underserved LGAs',
      'Establish additional IDP camps in southern Borno corridor',
      'Deploy rapid-response education programs',
      'Strengthen early warning systems in border regions',
    ],
  },
  {
    id: '2',
    title: 'Youth Development Strategy - BAY States',
    severity: 'high',
    status: 'Published',
    summary: 'Strategic framework for youth empowerment across the BAY states region, addressing unemployment, education gaps, and skill development.',
    keyPoints: [
      'Youth unemployment exceeds 45% across BAY states',
      'Vocational training programs reach only 12% of eligible youth',
      'Digital literacy remains below 20% in rural LGAs',
      'SME participation among youth declining year-over-year',
    ],
    recommendations: [
      'Scale vocational training centers in each LGA',
      'Launch digital skills initiative targeting rural communities',
      'Create youth enterprise fund with micro-loan access',
      'Partner with private sector for apprenticeship programs',
    ],
  },
  {
    id: '3',
    title: 'Education Gap Analysis',
    severity: 'medium',
    status: 'Published',
    summary: 'Detailed assessment of educational disparities across the BAY states, identifying systemic barriers and intervention opportunities.',
    keyPoints: [
      'Out-of-school rate highest in Yobe at 72%',
      'Gender gap in enrollment widening in rural areas',
      'Teacher-to-student ratio averages 1:85 in conflict zones',
      'Infrastructure damage affecting 40% of schools in Borno',
    ],
    recommendations: [
      'Prioritize school reconstruction in conflict-affected areas',
      'Implement community-based education for displaced children',
      'Increase teacher recruitment with conflict-zone incentives',
      'Deploy mobile learning solutions for remote communities',
    ],
  },
];

const sevColors = { critical: '#ef4444', high: '#f59e0b', medium: '#6ec6e8' };

export default function BriefsScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleShare = async (brief: PolicyBrief) => {
    try {
      await Share.share({
        title: brief.title,
        message: `${brief.title}\n\n${brief.summary}\n\nKey Points:\n${brief.keyPoints.map((p) => `- ${p}`).join('\n')}\n\nRecommendations:\n${brief.recommendations.map((r) => `- ${r}`).join('\n')}\n\n-- HUMAID BAY States Intelligence`,
      });
    } catch {}
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.intro}>
        Auto-generated policy recommendations based on BAY States humanitarian data analysis.
      </Text>

      {BRIEFS.map((brief) => {
        const isExp = expanded === brief.id;
        const sc = sevColors[brief.severity];

        return (
          <TouchableOpacity
            key={brief.id}
            activeOpacity={0.8}
            onPress={() => setExpanded(isExp ? null : brief.id)}
            style={[styles.briefCard, { borderLeftColor: sc }]}>

            <View style={styles.briefHeader}>
              <View style={[styles.sevBadge, { backgroundColor: sc + '20' }]}>
                <Text style={[styles.sevText, { color: sc }]}>{brief.severity.toUpperCase()}</Text>
              </View>
              <Text style={styles.statusText}>{brief.status}</Text>
            </View>

            <Text style={styles.briefTitle}>{brief.title}</Text>
            <Text style={styles.briefSummary}>{brief.summary}</Text>

            {isExp && (
              <View style={styles.expandedContent}>
                <Text style={styles.subHeading}>Key Points</Text>
                {brief.keyPoints.map((p, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bullet, { color: sc }]}>●</Text>
                    <Text style={styles.bulletText}>{p}</Text>
                  </View>
                ))}

                <Text style={[styles.subHeading, { marginTop: 16 }]}>Recommendations</Text>
                {brief.recommendations.map((r, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bullet, { color: '#f4b942' }]}>→</Text>
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}

                <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(brief)}>
                  <Text style={styles.shareBtnText}>Share Brief</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.expandHint}>{isExp ? 'Tap to collapse' : 'Tap to expand'}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  intro: { color: '#94a3b8', fontSize: 14, lineHeight: 20, padding: 16, paddingBottom: 8 },

  briefCard: {
    marginHorizontal: 16, marginBottom: 14, borderRadius: 12, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderLeftWidth: 4,
  },
  briefHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sevBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sevText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusText: { color: '#22c55e', fontSize: 12, fontWeight: '600' },
  briefTitle: { color: '#f5f5f5', fontSize: 17, fontWeight: '700', marginBottom: 8 },
  briefSummary: { color: '#94a3b8', fontSize: 13, lineHeight: 19 },
  expandHint: { color: '#64748b', fontSize: 12, marginTop: 10, textAlign: 'center', fontStyle: 'italic' },

  expandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  subHeading: { color: '#f5f5f5', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  bulletRow: { flexDirection: 'row', marginBottom: 6, paddingRight: 16 },
  bullet: { fontSize: 12, marginRight: 8, marginTop: 2 },
  bulletText: { color: '#e2e8f0', fontSize: 13, lineHeight: 19, flex: 1 },

  shareBtn: {
    marginTop: 20, borderRadius: 14, padding: 14, alignItems: 'center',
    backgroundColor: '#f4b942',
    shadowColor: '#f4b942', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
