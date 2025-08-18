import Feed from './Feed';

export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: '24px auto', fontFamily: 'system-ui, Arial' }}>
      <h1>LocalLoop</h1>
      <p style={{ color: '#555' }}>Nearby, anonymous messages.</p>
      <Feed />
    </main>
  );
}
