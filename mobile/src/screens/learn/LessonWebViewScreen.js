/**
 * LessonWebViewScreen
 *
 * Upgrades:
 *  - WEB_BASE with Android emulator (10.0.2.2) and iOS simulator (localhost) support.
 *  - Fixed injectedJavaScript trailing `true;` requirement for WKWebView.
 *  - Back button uses PressableScale with haptic feedback.
 */
import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, SafeAreaView,
  Text, ActivityIndicator, BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { haptic } from '../../theme/effects';
import PressableScale from '../../components/ui/PressableScale';

// Web frontend URL
import { WEB_BASE_URL as WEB_BASE } from '../../config/endpoints';

// CSS injected into WebView to hide desktop-only elements
const INJECTED_CSS = `
  (function() {
    var style = document.createElement('style');
    style.innerHTML = \`
      /* Hide desktop sidebar and AI assistants */
      .duo-mcb-sidebar, .duo-mcb-fab, [class*="DuoMCBSidebar"],
      [class*="GlobalSidebar"], #lang-toggle-btn { display: none !important; }
      /* Remove top padding added for desktop nav */
      body { padding-top: 0 !important; }
      /* Ensure content fills mobile width */
      .container, main { max-width: 100% !important; padding-left: 12px !important; padding-right: 12px !important; }
    \`;
    document.head.appendChild(style);
  })();
  true;
`;

export default function LessonWebViewScreen({ navigation, route }) {
  const { slug } = route.params;
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  const lessonUrl = `${WEB_BASE}/${slug}`;

  const handleBack = () => {
    haptic.tap();
    navigation.goBack();
  };

  // Handle Android hardware back
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [canGoBack, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Mini header bar */}
      <View style={styles.topBar}>
        <PressableScale style={styles.backBtn} onPress={handleBack} haptics={null}>
          <Text style={styles.backText}>← {slug}</Text>
        </PressableScale>
        {loading && <ActivityIndicator size="small" color={Colors.cyan} style={{ marginRight: Spacing.base }} />}
      </View>

      <WebView
        ref={webRef}
        source={{ uri: lessonUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        injectedJavaScript={INJECTED_CSS}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.cyan} />
            <Text style={styles.loadingText}>Đang tải bài học...</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    height: 48,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textCyan,
    maxWidth: 220,
  },
  webview: { flex: 1, backgroundColor: Colors.bg },
  loadingBox: {
    position: 'absolute', inset: 0,
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  loadingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.base,
  },
});
