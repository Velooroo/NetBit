# 📱 React Native Phone Auth - Документация

## Обзор

Компонент аутентификации по номеру телефона для мобильного приложения NetBit. Реализован на React Native с использованием Expo и включает полный flow аутентификации с SMS подтверждением.

## 🏗️ Архитектура компонента

### PhoneAuthScreen - Основной компонент

**Файл:** `packages/mobile/app/(auth)/phone.tsx`

**Назначение:** Двухэтапная аутентификация через номер телефона с SMS подтверждением.

### Этапы аутентификации

#### 1. Ввод номера телефона
- Выбор страны из списка популярных стран
- Автоматическое форматирование номера
- Валидация корректности номера
- Отправка SMS с кодом подтверждения

#### 2. Подтверждение кода
- Ввод 6-значного кода из SMS
- Автоматический переход между полями
- Таймер для повторной отправки (60 сек)
- Проверка кода и завершение аутентификации

## 📊 Структуры данных

### Country Interface
```typescript
interface Country {
  code: string;      // ISO код страны (RU, US, DE)
  name: string;      // Название страны
  flag: string;      // Emoji флага
  dialCode: string;  // Телефонный код (+7, +1, +49)
}
```

### Предустановленные страны
```typescript
const countries: Country[] = [
  { code: 'RU', name: 'Россия', flag: '🇷🇺', dialCode: '+7' },
  { code: 'US', name: 'США', flag: '🇺🇸', dialCode: '+1' },
  { code: 'UA', name: 'Украина', flag: '🇺🇦', dialCode: '+380' },
  { code: 'BY', name: 'Беларусь', flag: '🇧🇾', dialCode: '+375' },
  // ... другие страны
];
```

## 🎨 UI/UX Дизайн

### Цветовая схема
```typescript
const colors = {
  primary: '#3B82F6',      // Blue 500
  primaryLight: '#EFF6FF', // Blue 50
  background: '#F9FAFB',   // Gray 50
  white: '#FFFFFF',
  text: '#111827',         // Gray 900
  textSecondary: '#6B7280', // Gray 500
  border: '#D1D5DB',       // Gray 300
  success: '#10B981',      // Green 500
  disabled: '#9CA3AF'      // Gray 400
};
```

### Компоненты интерфейса

#### SafeAreaView с KeyboardAvoidingView
- Поддержка всех размеров экрана
- Автоматическое смещение при появлении клавиатуры
- Корректная работа на iOS и Android

#### Иконки (Ionicons)
- `phone-portrait` - для экрана ввода номера
- `chatbubble-ellipses` - для экрана подтверждения
- `arrow-back` - кнопка назад
- `chevron-down` - селектор страны

#### Стилизация
```typescript
const styles = StyleSheet.create({
  // Адаптивные размеры
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  // Rounded corners для современного вида
  phoneInput: { borderRadius: 12 },
  // Градиенты и тени
  sendButton: { backgroundColor: '#3B82F6', borderRadius: 12 },
  // Responsive typography
  title: { fontSize: 20, fontWeight: '600' }
});
```

## 🔧 Техническая реализация

### State Management
```typescript
const [selectedCountry, setSelectedCountry] = useState<Country>();
const [phoneNumber, setPhoneNumber] = useState('');
const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
const [step, setStep] = useState<'phone' | 'verification'>('phone');
const [isLoading, setIsLoading] = useState(false);
const [timer, setTimer] = useState(60);
```

### Форматирование номера телефона
```typescript
const formatPhoneNumber = (number: string) => {
  const cleaned = number.replace(/\D/g, '');
  
  // Для российских номеров: 999 999-99-99
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
```

### Обработка кода подтверждения
```typescript
const handleCodeInput = (value: string, index: number) => {
  const newCode = [...verificationCode];
  newCode[index] = value;
  setVerificationCode(newCode);

  // Автоматический переход к следующему полю
  if (value && index < 5) {
    codeInputs.current[index + 1]?.focus();
  }

  // Автоматическая проверка при вводе всех цифр
  if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
    verifyCode(newCode.join(''));
  }
};
```

### Таймер повторной отправки
```typescript
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (step === 'verification' && timer > 0) {
    interval = setInterval(() => {
      setTimer(timer - 1);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [step, timer]);
```

## 📱 Responsive Design

### Адаптация под устройства
- **iPhone SE (375px)** - компактный layout
- **iPhone 14 (390px)** - стандартный layout  
- **iPhone 14 Plus (428px)** - увеличенные элементы
- **iPad (768px)** - центрированный контент

### Platform-specific код
```typescript
<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.keyboardAvoid}
>
```

## 🔄 Интеграция с Backend

### API эндпоинты (планируемые)
```typescript
// Отправка SMS
POST /api/auth/send-sms
{
  "phone": "+79991234567",
  "country_code": "RU"
}

// Подтверждение кода
POST /api/auth/verify-sms
{
  "phone": "+79991234567", 
  "code": "123456"
}

// Ответ с токеном
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id": 1, "phone": "+79991234567" }
}
```

### Реальная интеграция
```typescript
const sendVerificationCode = async () => {
  try {
    const response = await fetch('/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `${selectedCountry.dialCode}${phoneNumber.replace(/\D/g, '')}`,
        country_code: selectedCountry.code
      })
    });
    
    if (response.ok) {
      setStep('verification');
      setTimer(60);
    } else {
      throw new Error('Ошибка отправки SMS');
    }
  } catch (error) {
    Alert.alert('Ошибка', error.message);
  }
};
```

## 🔐 Безопасность

### Защита от злоупотреблений
1. **Rate Limiting** - ограничение запросов SMS (1 раз в минуту)
2. **IP Filtering** - блокировка подозрительных IP
3. **Phone Validation** - проверка реальности номера
4. **Code Expiration** - срок действия кода 5 минут

### Валидация данных
```typescript
const validatePhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Минимальная длина номера
  if (cleaned.length < 6) return false;
  
  // Специфичная валидация по странам
  if (selectedCountry.code === 'RU') {
    return cleaned.length === 10;
  }
  
  return cleaned.length >= 6 && cleaned.length <= 15;
};
```

## 🧪 Тестирование

### Тестовые номера
```typescript
const testNumbers = {
  success: '+79991234567', // Успешная аутентификация
  failure: '+79999999999', // Ошибка отправки SMS
  invalid: '+7123',        // Некорректный номер
};

const testCodes = {
  success: '123456',       // Правильный код
  failure: '000000',       // Неправильный код
  expired: '999999'        // Истекший код
};
```

### Unit тесты
```typescript
describe('PhoneAuthScreen', () => {
  test('форматирование российского номера', () => {
    expect(formatPhoneNumber('9991234567')).toBe('999 123-45-67');
  });
  
  test('валидация номера телефона', () => {
    expect(validatePhoneNumber('9991234567')).toBe(true);
    expect(validatePhoneNumber('123')).toBe(false);
  });
  
  test('автоматический переход между полями кода', () => {
    // Тест логики handleCodeInput
  });
});
```

## 🚀 Развертывание

### Сборка для продакшн
```bash
cd packages/mobile
expo build:ios       # iOS сборка
expo build:android   # Android сборка
```

### Конфигурация Expo
```json
{
  "expo": {
    "name": "NetBit Messenger",
    "slug": "netbit-messenger",
    "platforms": ["ios", "android"],
    "permissions": [
      "READ_PHONE_STATE",
      "RECEIVE_SMS"
    ]
  }
}
```

## 📋 Accessibility

### Поддержка VoiceOver/TalkBack
```typescript
<TextInput
  accessible={true}
  accessibilityLabel="Поле ввода номера телефона"
  accessibilityHint="Введите ваш номер телефона для получения SMS"
  // ...
/>
```

### Поддержка крупного шрифта
- Использование relative units (em/rem)
- Масштабируемые иконки
- Адаптивные отступы

## 🔮 Будущие улучшения

### Краткосрочные
1. **Автоматическое чтение SMS** - Android SMS Retriever API
2. **Биометрическая аутентификация** - TouchID/FaceID
3. **Офлайн режим** - кэширование последнего успешного входа

### Долгосрочные
1. **Multi-factor authentication** - дополнительные методы защиты
2. **Social login** - вход через Google/Apple
3. **Enterprise SSO** - интеграция с корпоративными системами

---

**Статус:** ✅ Готово к тестированию  
**Платформы:** iOS 13+, Android 8+  
**Версия:** 1.0.0  
**Последнее обновление:** Декабрь 2024