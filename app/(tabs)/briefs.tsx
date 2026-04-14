import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  RefreshControl,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { api, computeSummary, filterByState, avgIndicator, fmt } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';
import { spacing, radius, background, semantic, brand } from '@/constants/Tokens';
import { Card, Text, Badge, Button, SkeletonRow } from '@/components/ui';

interface PolicyBrief {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  status: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
}

const sevColors = {
  critical: semantic.danger,
  high: semantic.warning,
  medium: semantic.info,
};

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

  const briefs = useMemo<PolicyBrief[]>(() => {
    const borno = computeSummary(filterByState(allRows, 'Borno'));
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
        summary: `Comprehensive analysis covering ${borno.totalLGAs} LGAs with ${fmt(borno.totalDisplacement)} displaced persons and ${fmt(borno.totalConflict)} conflict incidents.`,
        keyPoints: [
          `${fmt(borno.totalDisplacement)} internally displaced persons across ${borno.totalLGAs} LGAs`,
          `${fmt(borno.totalConflict)} conflict incidents concentrated in high-risk zones`,
          `Literacy at ${borno.avgLiteracy.toFixed(1)}%, unemployment at ${bornoUnemp.toFixed(1)}%`,
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
        summary: `Framework for youth empowerment across ${all.totalLGAs} LGAs with ${bayUnemp.toFixed(1)}% average unemployment and ${fmt(all.totalSMEs)} registered SMEs.`,
        keyPoints: [
          `Average youth unemployment at ${bayUnemp.toFixed(1)}% across BAY states`,
          `Total SMEs: ${fmt(all.totalSMEs)} — growth potential in stable zones`,
          `${fmt(all.totalDisplacement)} displaced persons affecting youth participation`,
          `Literacy averaging ${all.avgLiteracy.toFixed(1)}% — digital skills gap widening`,
        ],
        recommendations: [
          'Scale vocational training centers in each LGA',
          'Launch digital skills initiative in rural areas',
          'Create youth enterprise fund with micro-loan access',
          'Partner with private sector for apprenticeships',
        ],
      },
      {
        id: '3',
        title: 'Education Gap Analysis — Yobe Focus',
        severity: 'medium',
        status: 'Published',
        summary: `Assessment across ${yobe.totalLGAs} LGAs with literacy at ${yobe.avgLiteracy.toFixed(1)}% and unemployment at ${yobeUnemp.toFixed(1)}%.`,
        keyPoints: [
          `Literacy rate at ${yobe.avgLiteracy.toFixed(1)}% across ${yobe.totalLGAs} LGAs`,
          `${fmt(yobe.totalDisplacement)} displaced persons affecting school access`,
          `${fmt(yobe.totalConflict)} conflict incidents impacting infrastructure`,
          `Unemployment at ${yobeUnemp.toFixed(1)}%`,
        ],
        recommendations: [
          'Prioritize school reconstruction in conflict areas',
          'Community-based education for displaced children',
          'Increase teacher recruitment with incentives',
          'Deploy mobile learning solutions remotely',
        ],
      },
    ];
  }, [allRows]);

  const handleShare = async (brief: PolicyBrief) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await Share.share({
        title: brief.title,
        message: `${brief.title}\n\n${brief.summary}\n\nKey Points:\n${brief.keyPoints.map(p => `• ${p}`).join('\n')}\n\nRecommendations:\n${brief.recommendations.map(r => `→ ${r}`).join('\n')}\n\n— HUMAID BAY States Intelligence`,
      });
    } catch {}
  };

  const handleExpand = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    setExpanded(expanded === id ? null : id);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={brand.amber} />}>

      <Text variant="bodySm" color="tertiary" style={styles.intro}>
        Auto-generated policy recommendations based on {loading ? '...' : allRows.length} data points across the BAY States.
      </Text>

      {loading ? (
        [1, 2, 3].map((i) => <SkeletonRow key={i} />)
      ) : (
        briefs.map((brief) => {
          const isExp = expanded === brief.id;
          const sc = sevColors[brief.severity];

          return (
            <Card
              key={brief.id}
              level={2}
              padding="lg"
              onPress={() => handleExpand(brief.id)}
              accentColor={sc}
              accentPosition="left"
              style={styles.briefCard}>

              <View style={styles.briefHeader}>
                <Badge label={brief.severity.toUpperCase()} color={sc} size="sm" />
                <Text variant="caption" color={semantic.success} weight="700">{brief.status}</Text>
              </View>

              <Text variant="h3" color="primary" style={{ marginBottom: spacing.sm }}>
                {brief.title}
              </Text>
              <Text variant="bodySm" color="tertiary" style={{ lineHeight: 19 }}>
                {brief.summary}
              </Text>

              {isExp && (
                <View style={styles.expandedContent}>
                  <Text variant="h4" color="primary" style={{ marginBottom: spacing.md }}>
                    Key Points
                  </Text>
                  {brief.keyPoints.map((p, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text variant="bodySm" color={sc} weight="700">●</Text>
                      <Text variant="bodySm" color="secondary" style={styles.bulletText}>{p}</Text>
                    </View>
                  ))}

                  <Text variant="h4" color="primary" style={{ marginBottom: spacing.md, marginTop: spacing.lg }}>
                    Recommendations
                  </Text>
                  {brief.recommendations.map((r, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text variant="bodySm" color={brand.amber} weight="700">→</Text>
                      <Text variant="bodySm" color="secondary" style={styles.bulletText}>{r}</Text>
                    </View>
                  ))}

                  <View style={{ marginTop: spacing.xl }}>
                    <Button label="Share Brief" onPress={() => handleShare(brief)} fullWidth />
                  </View>
                </View>
              )}

              <Text variant="caption" color="muted" style={{ marginTop: spacing.md, textAlign: 'center', fontStyle: 'italic' }}>
                {isExp ? 'Tap to collapse' : 'Tap to expand'}
              </Text>
            </Card>
          );
        })
      )}

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  intro: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, lineHeight: 20 },
  briefCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  briefHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  expandedContent: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  bulletRow: { flexDirection: 'row', marginBottom: spacing.sm, paddingRight: spacing.lg, gap: spacing.sm },
  bulletText: { flex: 1, lineHeight: 19 },
});
