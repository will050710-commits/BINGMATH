import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { signInWithEmail } from '../../api/auth';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(t('Lỗi', 'Error'), t('Vui lòng điền đầy đủ thông tin.', 'Please fill in all fields.'));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
      // Auth state change handled by RootNavigator
    } catch (err) {
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
            <Text style={styles.logo}>🎓</Text>
            <Text style={styles.title}>{t('Đăng nhập', 'Sign In')}</Text>
            <Text style={styles.subtitle}>{t('Chào mừng quay lại DuoMath!', 'Welcome back to DuoMath!')}</Text>
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
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{t('Đăng nhập', 'Sign In')}</Text>
              }
            </TouchableOpacity>

            {/* Footer links */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('Chưa có tài khoản? ', "Don't have an account? ")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}>{t('Đăng ký miễn phí', 'Sign up free')}</Text>
              </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
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
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    marginBottom: Spacing.md,
  },
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  eyeBtn: {
    marginLeft: Spacing.sm,
    padding: Spacing.sm,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.base,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: { backgroundColor: Colors.textDim },
  btnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  link: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
});
