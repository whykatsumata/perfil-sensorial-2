import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';

/**
 * Modal de confirmação — funciona no web (View absoluta) e mobile (Modal nativo).
 *
 * Props:
 *   visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger
 */
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Excluir',
  cancelLabel  = 'Cancelar',
  onConfirm,
  onCancel,
  danger = true,
}) {
  if (!visible) return null;

  const inner = (
    <View style={s.overlay}>
      <TouchableOpacity style={s.backdrop} onPress={onCancel} activeOpacity={1} />
      <View style={s.box}>

        <View style={[s.iconWrap, { backgroundColor: danger ? '#FFF0EE' : '#FFF4E0' }]}>
          <Text style={s.icon}>{danger ? '🗑' : '⚠️'}</Text>
        </View>

        <Text style={s.title}>{title}</Text>

        {message ? <Text style={s.message}>{message}</Text> : null}

        <View style={s.btns}>
          <TouchableOpacity style={s.btnCancel} onPress={onCancel} activeOpacity={0.8}>
            <Text style={s.btnCancelTxt}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btnConfirm, { backgroundColor: danger ? '#C0547A' : '#C4703F' }]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={s.btnConfirmTxt}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );

  // Web: View absoluta (Modal nativo não funciona no web)
  if (Platform.OS === 'web') {
    return <View style={s.webRoot}>{inner}</View>;
  }

  // Mobile: Modal nativo
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      {inner}
    </Modal>
  );
}

const s = StyleSheet.create({
  // Raiz para web — cobre toda a tela por cima de tudo
  webRoot: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  // Backdrop semi-transparente atrás da caixa
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  box: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 10,
    // sombra web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  icon:    { fontSize: 26 },
  title:   { fontSize: 17, fontWeight: '800', color: '#1A1714', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 13, color: '#8C7B6B', textAlign: 'center', lineHeight: 19, marginBottom: 4 },
  btns:    { flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' },
  btnCancel: {
    flex: 1, backgroundColor: '#F0EAE0', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  btnCancelTxt:  { fontSize: 14, fontWeight: '700', color: '#5C5050' },
  btnConfirm:    { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnConfirmTxt: { fontSize: 14, fontWeight: '700', color: 'white' },
});
