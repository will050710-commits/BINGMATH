/**
 * LoginScreen
 *
 * Upgrades:
 *  - Tactile PressableScale on submit, eye-toggle, and register link.
 *  - Haptic feedback on validation/login errors and success.
 *  - BingMath owl mascot integrated with gradient glow.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, Image,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { haptic } from '../../theme/effects';
import { signInWithEmail } from '../../api/auth';
import { useLanguage } from '../../context/LanguageContext';
import PressableScale from '../../components/ui/PressableScale';
import GradientGlow from '../../components/ui/GradientGlow';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      haptic.warn();
      Alert.alert(t('Lỗi', 'Error'), t('Vui lòng điền đầy đủ thông tin.', 'Please fill in all fields.'));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
      haptic.success();
      // Auth state change handled by RootNavigator
    } catch (err) {
      haptic.warn();
      const msg = err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found'
        ? t('Sai email hoặc mật khẩu.', 'Wrong email or password.')
        : t('Đăng nhập thất bại. Vui lòng thử lại.', 'Login failed. Please try again.');
      Alert.alert(t('Lỗi đăng nhập', 'Login Error'), msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <GradientGlow colors={Colors.gradientGlow} style={styles.logoGlow} />
              <Image
                source={require('../../assets/images/owl.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{t('Đăng nhập', 'Sign In')}</Text>
            <Text style={styles.subtitle}>{t('Chào mừng quay lại BingMath!', 'Welcome back to BingMath!')}</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textDim}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            {/* Password */}
            <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('Mật khẩu', 'Password')}</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder={t('Nhập mật khẩu', 'Enter password')}
                placeholderTextColor={Colors.textDim}
                secureTextEntry={!showPw}
                autoComplete="password"
              />
              <PressableScale style={styles.eyeBtn} onPress={() => setShowPw(v => !v)} haptics="tap">
                <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
              </PressableScale>
            </View>

            {/* Submit */}
            <PressableScale
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              haptics={null}
              scaleTo={0.97}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{t('Đăng nhập', 'Sign In')}</Text>
              )}
            </PressableScale>

            {/* Footer links */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('Chưa có tài khoản? ', "Don't have an account? ")}</Text>
              <PressableScale onPress={() => navigation.navigate('SignUp')} haptics="tap">
                <Text style={styles.link}>{t('Đăng ký ngay', 'Sign Up')}</Text>
              </PressableScale>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    padding: Spacing.xl,
    paddingTop: Spacing['3xl'],
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoWrap: {
    width: 90, height: 90,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, position: 'relative',
  },
  logoGlow: {
    position: 'absolute', inset: -10, borderRadius: 55,
  },
  logoImage: { width: 72, height: 72 },
  title: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.bgGlass,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.base,
    padding: 4,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  link: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.cyan,
  },
});
