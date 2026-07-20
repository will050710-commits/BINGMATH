import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { registerWithEmail } from '../../api/auth';
import { useLanguage } from '../../context/LanguageContext';

const GRADES = ['Grade 10', 'Grade 11', 'Grade 12', 'Other'];

export default function SignUpScreen({ navigation }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
    phone: '', school: '', grade: 'Grade 10',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);

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
    if (err) { Alert.alert(t('Lỗi', 'Error'), err); return; }
    setLoading(true);
    try {
      await registerWithEmail(form.email.trim().toLowerCase(), form.password, {
        username: form.username.trim(),
        phone: form.phone.trim(),
        school: form.school.trim(),
        grade: form.grade,
      });
    } catch (e) {
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
            <Text style={styles.logo}>🎓</Text>
            <Text style={styles.title}>{t('Tạo tài khoản', 'Create Account')}</Text>
            <Text style={styles.subtitle}>{t('Miễn phí · Lưu điểm & thống kê cá nhân', 'Free · Save scores & personal stats')}</Text>
          </View>

          <View style={styles.card}>
            {/* Username */}
            <Text style={styles.label}>{t('Tên người dùng *', 'Username *')}</Text>
            <TextInput style={styles.input} value={form.username} onChangeText={set('username')}
              placeholder={t('Họ tên của bạn', 'Your full name')} placeholderTextColor={Colors.textDim} />

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={set('email')}
              placeholder="you@example.com" placeholderTextColor={Colors.textDim}
              autoCapitalize="none" keyboardType="email-address" />

            {/* School */}
            <Text style={styles.label}>{t('Trường học', 'School')} <Text style={styles.optional}>({t('không bắt buộc', 'optional')})</Text></Text>
            <TextInput style={styles.input} value={form.school} onChangeText={set('school')}
              placeholder={t('VD: THPT Nguyễn Chí Thanh', 'E.g: Lincoln High School')} placeholderTextColor={Colors.textDim} />

            {/* Grade picker */}
            <Text style={styles.label}>{t('Lớp', 'Grade')}</Text>
            <View style={styles.gradeRow}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradeChip, form.grade === g && styles.gradeChipActive]}
                  onPress={() => set('grade')(g)}
                >
                  <Text style={[styles.gradeText, form.grade === g && styles.gradeTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Password */}
            <Text style={[styles.label, { marginTop: Spacing.sm }]}>{t('Mật khẩu *', 'Password *')} <Text style={styles.optional}>({t('tối thiểu 6 ký tự', 'min 6 chars')})</Text></Text>
            <View style={styles.pwRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={form.password}
                onChangeText={set('password')} placeholder={t('Tạo mật khẩu', 'Create a password')}
                placeholderTextColor={Colors.textDim} secureTextEntry={!showPw} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm */}
            <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('Xác nhận mật khẩu *', 'Confirm Password *')}</Text>
            <TextInput style={styles.input} value={form.confirm} onChangeText={set('confirm')}
              placeholder={t('Nhập lại mật khẩu', 'Re-enter password')} placeholderTextColor={Colors.textDim}
              secureTextEntry={!showPw} />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignUp} disabled={loading} activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{t('Tạo tài khoản', 'Create Account')}</Text>
              }
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('Đã có tài khoản? ', 'Already have an account? ')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>{t('Đăng nhập', 'Sign In')}</Text>
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
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 40, marginBottom: Spacing.sm },
  title: { fontFamily: FontFamily.black, fontSize: FontSize['2xl'], color: Colors.text, marginBottom: 6 },
  subtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  card: { backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  label: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xs },
  optional: { fontFamily: FontFamily.regular, color: Colors.textDim },
  input: {
    backgroundColor: Colors.bgGlass, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    color: Colors.text, fontFamily: FontFamily.regular, fontSize: FontSize.base, marginBottom: Spacing.md,
  },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  gradeChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border },
  gradeChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  gradeText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textMuted },
  gradeTextActive: { color: '#fff' },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  eyeBtn: { marginLeft: Spacing.sm, padding: Spacing.sm },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.base, alignItems: 'center', marginBottom: Spacing.base, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  btnDisabled: { backgroundColor: Colors.textDim },
  btnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  footerText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  link: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.primary },
});
