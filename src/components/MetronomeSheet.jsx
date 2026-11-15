import MetronomePanel from './MetronomePanel.jsx';
import Sheet from './Sheet.jsx';

export default function MetronomeSheet({ open, onClose, m }) {
  return <Sheet open={open} onClose={onClose} title="Metronome"><MetronomePanel m={m} /></Sheet>;
}
