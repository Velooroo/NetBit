import { Redirect } from 'expo-router';

export default function Index() {
  // Редиректим на страницу входа
  return <Redirect href="/(auth)" />;
}
