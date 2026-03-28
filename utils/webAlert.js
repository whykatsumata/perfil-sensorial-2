import { Alert, Platform } from 'react-native';

/**
 * Alert compatível com web e mobile.
 * Na web usa window.confirm (dois botões) ou window.alert (um botão).
 * No mobile usa Alert.alert nativo.
 */
export function webAlert(title, message, buttons = [{ text: 'OK' }]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const confirmBtn = buttons.find(b => b.style !== 'cancel' && b.onPress);
  const cancelBtn  = buttons.find(b => b.style === 'cancel');
  const msg = [title, message].filter(Boolean).join('\n\n');

  if (confirmBtn && cancelBtn) {
    if (window.confirm(msg)) confirmBtn.onPress?.();
    else cancelBtn?.onPress?.();
  } else {
    window.alert(msg);
    confirmBtn?.onPress?.();
  }
}
