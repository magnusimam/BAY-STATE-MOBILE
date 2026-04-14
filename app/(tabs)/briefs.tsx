import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { api, computeSummary, filterByState, avgIndicator, fmt } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';

interface PolicyBrief {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  status: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
}

const sevColors = { critical: '#ef4444', high: '#f59e0b', medium: '#6ec6e8' };

export default function BriefsScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [allRows, setAllRows] = useState<MasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.getMaster();
      setAllRows(res.data ?? []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute live values for briefs (same as web app)
  const briefs = useMemo<PolicyBrief[]>(() => {
    const borno = computeSummary(filterByState(allRows, 'Borno'));
    const adamawa = computeSummary(filterByState(allRows, 'Adamawa'));
    const yobe = computeSummary(filterByState(allRows, 'Yobe'));
    const all = computeSummary(allRows);

    const bornoUnemp = avgIndicator(filterByState(allRows, 'Borno'), 'Unemployment Rate');
    const bayUnemp = avgIndicator(allRows, 'Unemployment Rate');
    const yobeUnemp = avgIndicator(filterByState(allRows, 'Yobe'), 'Unemployment Rate');

    return [
      {
        id: '1',
        title: 'Borno State Crisis Response',
        severity: 'critical',
        status: 'Published',
        summary: `Comprehensive analysis of the ongoing humanitarian crisis in Borno State, covering ${borno.totalLGAs} LGAs with ${fmt(borno.totalDisplacement)} displaced persons and ${fmt(borno.totalConflict)} conflict incidents.`,
        keyPoints: [
          `${fmt(borno.totalDisplacement)} internally displaced persons across ${borno.totalLGAs} LGAs`,
          `${fmt(borno.totalConflict)} conflict incidents concentrated in high-risk zones`,
          `Average literacy rate at ${borno.avgLiteracy.toFixed(1)}%, unemployment at ${bornoUnemp.toFixed(1)}%`,
          `${fmt(borno.totalSMEs)} SMEs registered — economic recovery underway`,
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
        title: 'Youth Development Strategy — BAY States',
        severity: 'high',
        status: 'Published',
        summary: `Strategic framework for youth empowerment across ${all.totalLGAs} LGAs in the BAY states, addressing ${bayUnemp.toFixed(1)}% average unemployment and ${fmt(all.totalSMEs)} registered SMEs.`,
        keyPoints: [
          `Average youth unemployment at ${bayUnemp.toFixed(1)}% across BAY states`,
          `Total SMEs: ${fmt(all.totalSMEs)} — growth potential in stable zones`,
          `${fmt(all.totalDisplacement)} displaced persons affecting youth participation`,
          `Literacy averaging ${all.avgLiteracy.toFixed(1)}% — digital skills gap widening`,
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
        title: 'Education Gap Analysis — Yobe Focus',
        severity: 'medium',
        status: 'Published',
        summary: `Assessment of educational disparities in Yobe State across ${yobe.totalLGAs} LGAs, with literacy at ${yobe.avgLiteracy.toFixed(1)}% and unemployment at ${yobeUnemp.toFixed(1)}%.`,
        keyPoints: [
          `Literacy rate at ${yobe.avgLiteracy.toFixed(1)}% across ${yobe.totalLGAs} LGAs`,
          `${fmt(yobe.totalDisplacement)} displaced persons affecting school access`,
          `${fmt(yobe.totalConflict)} conflict incidents impacting infrastructure`,
          `Unemployment at ${yobeUnemp.toFixed(1)}% — highest among BAY youth`,
        ],
        recommendations: [
          'Prioritize school reconstruction in conflict-affected areas',
          'Implement community-based education for displaced children',
          'Increase teacher recruitment with conflict-zone incentives',
          'Deploy mobile learning solutions for remote communities',
        ],
      },
    ];
  }, [allRows]);

  const handleShare = async (brief: PolicyBrief) => {
    try {
      await Share.share({
        title: brief.title,
        message: `${brief.title}\n\n${brief.summary}\n\nKey Points:\n${brief.keyPoints.map(p => `- ${p}`).join('\n')}\n\nRecommendations:\n${brief.recommendations.map(r => `- ${r}`).join('\n')}\n\n-- HUMAID BAY States Intelligence`,
      });
    } catch {}
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#f4b942" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#f4b942" />}>

      <Text style={styles.intro}>
        Auto-generated policy recommendations based on {allRows.length} data points across the BAY States.
      </Text>

      {briefs.map((brief) => {
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
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
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
