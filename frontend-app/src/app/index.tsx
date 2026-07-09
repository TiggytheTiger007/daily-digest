import { useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionItem {
  primaryText: string;
  secondaryText: string;
  url?: string; // New Optional URL field
}

interface DigestSection {
  title: string;
  layout: 'bullets' | 'links' | 'metrics';
  items: SectionItem[];
  footerNote?: string;
}

interface DigestData {
  date: string;
  sections: DigestSection[];
}

export default function App() {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(true);

  const generateBriefing = () => {
    setLoading(true);
    setIsConfiguring(false);

    fetch('http://localhost:3000/api/digest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // We swapped "Tennis" for broader sports terms so NewsAPI casts a wider net
    interests: ["Global News", "Tech Internships", "World Cup", "NBA Offseason", "MLB", "Stock Market"],
    customInstructions: "Format as a dense morning briefing."
  })
})
      .then((response) => response.json())
      .then((data: DigestData) => {
        setDigest(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        setIsConfiguring(true);
      });
  };

  // Helper function to open links
  const openLink = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
    }
  };

  if (isConfiguring) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <TouchableOpacity style={styles.button} onPress={generateBriefing}>
              <Text style={styles.buttonText}>Generate Morning Briefing</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
  }

  if (loading) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Compiling briefing...</Text>
          </View>
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <Text style={styles.dateHeader}>Morning Digest — {digest?.date}</Text>

        {digest?.sections.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.sectionBody}>
              {section.items.map((item, idx) => {
                
                // Wrap the item in a TouchableOpacity if a URL exists
                const RowWrapper = item.url ? TouchableOpacity : View;

                if (section.layout === 'metrics') {
                  return (
                    <RowWrapper key={idx} style={styles.metricRow} onPress={() => openLink(item.url)}>
                      <Text style={styles.metricName}>{item.primaryText}</Text>
                      <Text style={styles.metricValue}>{item.secondaryText}</Text>
                    </RowWrapper>
                  );
                }

                if (section.layout === 'links') {
                  return (
                    <RowWrapper key={idx} style={styles.linkRow} onPress={() => openLink(item.url)}>
                      <Text style={[styles.linkTitle, item.url && styles.clickableText]}>
                        {item.url ? '🔗 ' : '📍 '}{item.primaryText}
                      </Text>
                      <Text style={styles.linkSubtext}>{item.secondaryText}</Text>
                    </RowWrapper>
                  );
                }

                return (
                  <RowWrapper key={idx} style={styles.bulletRow} onPress={() => openLink(item.url)}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={{fontWeight: 'bold'}}>{item.primaryText} </Text>
                      — {item.secondaryText}
                      {item.url && <Text style={styles.readMore}> (Read More)</Text>}
                    </Text>
                  </RowWrapper>
                );
              })}
            </View>

            {section.footerNote && (
              <Text style={styles.footerNote}>{section.footerNote}</Text>
            )}
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  loadingText: { marginTop: 10, color: '#666' },
  
  dateHeader: { fontSize: 22, fontWeight: '900', marginBottom: 24, color: '#000' },
  sectionContainer: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { gap: 10 },
  
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bulletPoint: { fontSize: 16, marginRight: 8, color: '#000' },
  bulletText: { fontSize: 15, color: '#333', flex: 1, lineHeight: 22 },
  readMore: { color: '#0066CC', fontStyle: 'italic' },
  
  linkRow: { marginBottom: 8, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 },
  linkTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  clickableText: { color: '#0066CC' }, // Make the title blue if it's clickable
  linkSubtext: { fontSize: 14, color: '#555', marginTop: 4 },
  
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 8 },
  metricName: { fontSize: 15, fontWeight: '600' },
  metricValue: { fontSize: 15, color: '#28A745', fontWeight: '700' },
  
  footerNote: { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 12 }
});