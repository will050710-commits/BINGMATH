/**
 * SignUpScreen
 *
 * Upgrades:
 *  - Added missing phone field to match registerWithEmail payload and SettingsScreen.
 *  - Tactile PressableScale on eye-toggle, grade chips, submit, and sign-in link.
 *  - Haptic feedback on validation errors and account creation success.
 *  - BingMath owl mascot with gradient glow.
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
import { registerWithEmail } from '../../api/auth';
import { useLanguage } from '../../context/LanguageContext';
import PressableScale from '../../components/ui/PressableScale';
import GradientGlow from '../../components/ui/GradientGlow';

const GRADES = ['Grade 10', 'Grade 11', 'Grade 12', 'Other'];

export default function SignUpScreen({ navigation }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
    phone: '', school: '', grade: 'Grade 10',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  function validate() {
    if (!form.username.trim()) return t('Tên người dùng không được để trống.', 'Username is required.');
    if (!form.email.trim()) return t('Email không được để trống.', 'Email is required.');
    if (!/\S+@\S+\.\S+/.test(form.email)) return t('Email không hợp lệ.', 'Invalid email.');
    if (form.password.length < 6) return t('Mật khẩu phải có ít nhất 6 ký tự.', 'Password must be at least 6 characters.');
    if (form.password !== form.confirm) return t('Mật khẩu không khớp.', 'Passwords do not match.');
    return null;
  }

  async function handleSignUp() {
    const err = validate();
    if (err) {
      haptic.warn();
      Alert.alert(t('Lỗi', 'Error'), err);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(form.email.trim().toLowerCase(), form.password, {
        username: form.username.trim(),
        phone: form.phone.trim(),
        school: form.school.trim(),
        grade: form.grade,
      });
      haptic.success();
    } catch (e) {
      haptic.warn();
      const msg = e?.code === 'auth/email-already-in-use'
        ? t('Email đã được sử dụng.', 'Email already in use.')
        : t('Đăng ký thất bại. Vui lòng thử lại.', 'Registration failed. Please try again.');
      Alert.alert(t('Lỗi đăng ký', 'Sign Up Error'), msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <GradientGlow colors={Colors.gradientGlow} style={styles.logoGlow} />
              <Image
                source={require('../../assets/images/owl.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{t('Tạo tài khoản', 'Create Account')}</Text>
            <Text style={styles.subtitle}>{t('Miễn phí · Tham gia BingMath cùng bạn bè', 'Free · Join BingMath with friends')}</Text>
          </View>

          <View style={styles.card}>
            {/* Username */}
            <Text style={styles.label}>{t('Tên người dùng *', 'Username *')}</Text>
            <TextInput
              style={styles.input}
              value={form.username}
              onChangeText={set('username')}
              placeholder={t('Họ tên của bạn', 'Your full name')}
              placeholderTextColor={Colors.textDim}
            />

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={set('email')}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textDim}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Phone */}
            <Text style={styles.label}>{t('Số điện thoại', 'Phone')} <Text style={styles.optional}>({t('không bắt buộc', 'optional')})</Text></Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="+84 ..."
              placeholderTextColor={Colors.textDim}
              keyboardType="phone-pad"
            />

            {/* School */}
            <Text style={styles.label}>{t('Trường học', 'School')} <Text style={styles.optional}>({t('không bắt buộc', 'optional')})</Text></Text>
            <TextInput
              style={styles.input}
              value={form.school}
              onChangeText={set('school')}
              placeholder={t('VD: THPT Nguyễn Chí Thanh', 'E.g: Lincoln High School')}
              placeholderTextColor={Colors.textDim}
            />

            {/* Grade picker */}
            <Text style={styles.label}>{t('Lớp', 'Grade')}</Text>
            <View style={styles.gradeRow}>
              {GRADES.map((g) => (
                <PressableScale
                  key={g}
                  style={[styles.gradeChip, form.grade === g && styles.gradeChipActive]}
                  onPress={() => set('grade')(g)}
                  haptics="select"
                  scaleTo={0.94}
                >
                  <Text style={[styles.gradeText, form.grade === g && styles.gradeTextActive]}>{g}</Text>
                </PressableScale>
              ))}
            </View>

            {/* Password */}
            <Text style={[styles.label, { marginTop: Spacing.sm }]}>
              {t('Mật khẩu *', 'Password *')} <Text style={styles.optional}>({t('tối thiểu 6 ký tự', 'min 6 chars')})</Text>
            </Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={form.password}
                onChangeText={set('password')}
                placeholder={t('Mật khẩu', 'Password')}
                placeholderTextColor={Colors.textDim}
                secureTextEntry={!showPw}
              />
              <PressableScale style={styles.eyeBtn} onPress={() => setShowPw(v => !v)} haptics="tap">
                <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
              </PressableScale>
            </View>

            {/* Confirm password */}
            <Text style={styles.label}>{t('Xác nhận mật khẩu *', 'Confirm Password *')}</Text>
            <TextInput
              style={styles.input}
              value={form.confirm}
              onChangeText={set('confirm')}
              placeholder={t('Nhập lại mật khẩu', 'Re-enter password')}
              placeholderTextColor={Colors.textDim}
              secureTextEntry={!showPw}
            />

            {/* Submit */}
            <PressableScale
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              haptics={null}
              scaleTo={0.97}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{t('Tạo tài khoản', 'Create Account')}</Text>
              )}
            </PressableScale>

            {/* Footer links */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('Đã có tài khoản? ', 'Already have an account? ')}</Text>
              <PressableScale onPress={() => navigation.navigate('Login')} haptics="tap">
                <Text style={styles.link}>{t('Đăng nhập', 'Sign In')}</Text>
              </PressableScale>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.xl, paddingTop: Spacing['2xl'] },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoWrap: {
    width: 90, height: 90,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, position: 'relative',
  },
  logoGlow: { position: 'absolute', inset: -10, borderRadius: 55 },
  logoImage: { width: 72, height: 72 },
  title: { fontFamily: FontFamily.black, fontSize: FontSize['2xl'], color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  card: { backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  label: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xs },
  optional: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDim },
  input: {
    backgroundColor: Colors.bgGlass, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.base, paddingVertical: 12, fontFamily: FontFamily.regular, fontSize: FontSize.base,
    color: Colors.text, marginBottom: Spacing.sm,
  },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  gradeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border },
  gradeChipActive: { backgroundColor: Colors.cyan + '20', borderColor: Colors.cyan },
  gradeText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.textMuted },
  gradeTextActive: { color: Colors.cyan, fontFamily: FontFamily.bold },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  eyeBtn: { position: 'absolute', right: Spacing.base, padding: 4 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl },
  footerText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  link: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.cyan },
});
