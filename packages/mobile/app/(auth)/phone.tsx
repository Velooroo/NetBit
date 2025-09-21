import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export default function PhoneAuthScreen() {
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    dialCode: '+7'
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const codeInputs = useRef<(TextInput | null)[]>([]);

  // Популярные страны для выбора
  const countries: Country[] = [
    { code: 'RU', name: 'Россия', flag: '🇷🇺', dialCode: '+7' },
    { code: 'US', name: 'США', flag: '🇺🇸', dialCode: '+1' },
    { code: 'UA', name: 'Украина', flag: '🇺🇦', dialCode: '+380' },
    { code: 'BY', name: 'Беларусь', flag: '🇧🇾', dialCode: '+375' },
    { code: 'KZ', name: 'Казахстан', flag: '🇰🇿', dialCode: '+7' },
    { code: 'DE', name: 'Германия', flag: '🇩🇪', dialCode: '+49' },
    { code: 'FR', name: 'Франция', flag: '🇫🇷', dialCode: '+33' },
    { code: 'GB', name: 'Великобритания', flag: '🇬🇧', dialCode: '+44' },
  ];

  // Таймер для повторной отправки кода
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verification' && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Форматирование номера телефона
  const formatPhoneNumber = (number: string) => {
    // Удаляем все нецифровые символы
    const cleaned = number.replace(/\D/g, '');
    
    // Форматируем в зависимости от страны
    if (selectedCountry.code === 'RU' && cleaned.length <= 10) {
      if (cleaned.length >= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      } else if (cleaned.length >= 3) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      }
      return cleaned;
    }
    
    return cleaned;
  };

  // Отправка SMS с кодом
  const sendVerificationCode = async () => {
    if (phoneNumber.length < 6) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    
    // Имитация отправки SMS
    setTimeout(() => {
      setIsLoading(false);
      setStep('verification');
      setTimer(60);
      Alert.alert(
        'Код отправлен',
        `SMS с кодом подтверждения отправлен на номер ${selectedCountry.dialCode} ${phoneNumber}`
      );
    }, 1500);
  };

  // Обработка ввода кода подтверждения
  const handleCodeInput = (value: string, index: number) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Автоматический переход к следующему полю
    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }

    // Если введены все цифры, проверяем код
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  // Обработка удаления в коде
  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  // Проверка кода подтверждения
  const verifyCode = async (code: string) => {
    setIsLoading(true);
    
    // Имитация проверки кода
    setTimeout(() => {
      setIsLoading(false);
      if (code === '123456') {
        Alert.alert('Успешно!', 'Вход выполнен успешно', [
          { text: 'OK', onPress: () => console.log('Redirecting to main app...') }
        ]);
      } else {
        Alert.alert('Ошибка', 'Неверный код подтверждения');
        setVerificationCode(['', '', '', '', '', '']);
        codeInputs.current[0]?.focus();
      }
    }, 1000);
  };

  // Повторная отправка кода
  const resendCode = () => {
    setVerificationCode(['', '', '', '', '', '']);
    setTimer(60);
    sendVerificationCode();
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
  };

  if (step === 'verification') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setStep('phone')}
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.title}>Подтверждение</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses" size={64} color="#3B82F6" />
              </View>

              <Text style={styles.subtitle}>
                Введите код из SMS
              </Text>
              
              <Text style={styles.description}>
                Мы отправили код подтверждения на номер{'\n'}
                <Text style={styles.phoneText}>{selectedCountry.dialCode} {phoneNumber}</Text>
              </Text>

              <View style={styles.codeContainer}>
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => codeInputs.current[index] = ref}
                    style={[
                      styles.codeInput,
                      digit ? styles.codeInputFilled : {}
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeInput(value, index)}
                    onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <View style={styles.timerContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Повторно отправить через {timer} сек
                  </Text>
                ) : (
                  <TouchableOpacity onPress={resendCode}>
                    <Text style={styles.resendText}>Отправить код повторно</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>NetBit Messenger</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="phone-portrait" size={64} color="#3B82F6" />
            </View>

            <Text style={styles.subtitle}>
              Добро пожаловать в NetBit!
            </Text>
            
            <Text style={styles.description}>
              Введите номер телефона для входа{'\n'}в мессенджер команды разработчиков
            </Text>

            <View style={styles.phoneInputContainer}>
              <TouchableOpacity style={styles.countrySelector}>
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                placeholder="Номер телефона"
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                phoneNumber.length < 6 ? styles.sendButtonDisabled : {}
              ]}
              onPress={sendVerificationCode}
              disabled={isLoading || phoneNumber.length < 6}
            >
              {isLoading ? (
                <Text style={styles.sendButtonText}>Отправка...</Text>
              ) : (
                <Text style={styles.sendButtonText}>Получить код</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Нажимая "Получить код", вы соглашаетесь с{'\n'}
              <Text style={styles.link}>Условиями использования</Text> и{' '}
              <Text style={styles.link}>Политикой конфиденциальности</Text>
            </Text>

            {/* Список стран */}
            <View style={styles.countriesContainer}>
              <Text style={styles.countriesTitle}>Популярные страны:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.countriesScroll}
              >
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryItem,
                      selectedCountry.code === country.code ? styles.countryItemSelected : {}
                    ]}
                    onPress={() => selectCountry(country)}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={styles.countryName}>{country.name}</Text>
                    <Text style={styles.countryCode}>{country.dialCode}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  phoneText: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  link: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  codeInputFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  countriesContainer: {
    marginTop: 32,
  },
  countriesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  countriesScroll: {
    flexDirection: 'row',
  },
  countryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countryItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  countryFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  countryCode: {
    fontSize: 11,
    color: '#6B7280',
  },
});